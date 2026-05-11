"""Upload router — handles resume and JD file uploads."""

import os
import logging
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
import aiosqlite

from app.dependencies import get_current_user_id
from app.config import get_settings
from app.models.schemas import UploadResponse, DocType
from app.models.database import get_db_path
from app.services.document_parser import parse_document
from app.services.chunker import chunk_text
from app.services.embeddings import generate_embeddings
from app.services.vector_store import create_or_update_index
from app.services.llm import call_llm

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    doc_type: DocType = Form(...),
    user_id: str = Depends(get_current_user_id),
):
    """
    Upload a resume or job description document.
    Parses, chunks, embeds, and stores in the user's vector database.
    """
    settings = get_settings()
    
    # Validate file type
    allowed_extensions = {
        DocType.RESUME: [".pdf", ".docx"],
        DocType.JD: [".pdf", ".txt"],
    }
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions[doc_type]:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{ext}' for {doc_type.value}. "
                   f"Allowed: {allowed_extensions[doc_type]}"
        )

    # Save file to disk
    user_dir = os.path.join(settings.DATA_DIR, user_id, "uploads")
    os.makedirs(user_dir, exist_ok=True)
    file_path = os.path.join(user_dir, f"{doc_type.value}{ext}")

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    try:
        # Step 1: Parse document
        text = parse_document(file_path)
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from document.")

        # Step 2: Chunk text
        chunks = chunk_text(text)
        logger.info(f"Created {len(chunks)} chunks for {doc_type.value} (user: {user_id})")

        # Step 3: Generate embeddings
        chunk_texts = [c["text"] for c in chunks]
        embeddings = await generate_embeddings(chunk_texts)

        # Step 4: Store in FAISS
        num_indexed = create_or_update_index(
            user_id=user_id,
            doc_type=doc_type.value,
            chunks=chunks,
            embeddings=embeddings,
        )

        # Step 5: Generate summary
        summary = await _generate_summary(text[:3000], doc_type.value)

        # Step 6: Record in database
        async with aiosqlite.connect(get_db_path()) as db:
            await db.execute(
                """INSERT OR REPLACE INTO documents (user_id, doc_type, filename, summary, file_path)
                   VALUES (?, ?, ?, ?, ?)""",
                (user_id, doc_type.value, file.filename, summary, file_path),
            )
            await db.commit()

        return UploadResponse(
            message=f"{doc_type.value.title()} uploaded and processed successfully.",
            doc_type=doc_type,
            filename=file.filename,
            summary=summary,
            chunks_created=num_indexed,
        )

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        logger.error(f"Upload processing failed: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


async def _generate_summary(text: str, doc_type: str) -> str:
    """Generate a brief summary of the uploaded document."""
    try:
        result = await call_llm(
            system_prompt="You are a document summarizer. Provide a concise 2-3 sentence summary.",
            user_prompt=f"Summarize this {doc_type}:\n\n{text}",
            temperature=0.3,
            max_tokens=200,
            json_mode=False,
        )
        return result if isinstance(result, str) else str(result)
    except Exception:
        return f"{doc_type.title()} uploaded successfully (summary unavailable)."


@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: int,
    user_id: str = Depends(get_current_user_id),
):
    """
    Safely delete a document from the system.
    This wipes from Pinecone, physical disk, and finally SQLite as source-of-truth.
    """
    from app.services.vector_store import delete_document_vectors

    async with aiosqlite.connect(get_db_path()) as db:
        db.row_factory = aiosqlite.Row
        
        # 1. Look up document info explicitly gated by user_id
        cursor = await db.execute(
            "SELECT doc_type, file_path FROM documents WHERE id = ? AND user_id = ?",
            (document_id, user_id)
        )
        row = await cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Document not found or unauthorized.")
            
        doc_type = row["doc_type"]
        file_path = row["file_path"]
        
        try:
            # 2. Wipe Vectors First globally using Pinecone
            delete_document_vectors(user_id=user_id, doc_type=doc_type)
            
            # 3. Safely drop physical uploaded file
            if os.path.exists(file_path):
                os.remove(file_path)
                
            # 4. Final DB commit (acting as lock source of truth)
            await db.execute(
                "DELETE FROM documents WHERE id = ? AND user_id = ?",
                (document_id, user_id)
            )
            await db.commit()
            
            return {"message": "Document systematically wiped.", "id": document_id}
            
        except Exception as e:
            logger.error(f"Failed transactional delete for document {document_id}: {e}")
            raise HTTPException(status_code=500, detail="Data rollback triggered during document wipe.")

