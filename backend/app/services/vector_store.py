"""Pinecone vector store with per-user namespaces."""

import logging
from pinecone import Pinecone
from app.config import get_settings

logger = logging.getLogger(__name__)

_pc = None
_index = None

def _get_index():
    """Lazy-load Pinecone index."""
    global _pc, _index
    if _index is None:
        settings = get_settings()
        if not settings.PINECONE_API_KEY:
            logger.warning("Pinecone API key not set!")
            return None
            
        try:
            from pinecone import ServerlessSpec
            _pc = Pinecone(api_key=settings.PINECONE_API_KEY)
            
            # Auto-create index if it does not exist
            if settings.PINECONE_INDEX_NAME not in _pc.list_indexes().names():
                logger.info(f"Creating Pinecone index: {settings.PINECONE_INDEX_NAME}")
                _pc.create_index(
                    name=settings.PINECONE_INDEX_NAME,
                    dimension=settings.EMBEDDING_DIMENSIONS,
                    metric='cosine',
                    spec=ServerlessSpec(cloud='aws', region='us-east-1')
                )
                
            _index = _pc.Index(settings.PINECONE_INDEX_NAME)
        except Exception as e:
            logger.error(f"Failed to initialize Pinecone: {e}")
            raise
    return _index

def create_or_update_index(
    user_id: str,
    doc_type: str,
    chunks: list[dict],
    embeddings: list[list[float]],
) -> int:
    """
    Upsert vectors to Pinecone under the user's namespace.

    Args:
        user_id: Firebase user ID (used as namespace)
        doc_type: 'resume' or 'jd'
        chunks: List of {"text": str, "section": str, "index": int, "token_count": int}
        embeddings: List of embedding vectors

    Returns:
        Number of vectors indexed
    """
    index = _get_index()
    if not index:
        return 0

    # Map doc_type to expected source values internally
    source = "resume" if doc_type == "resume" else "job_description"

    vectors = []
    for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
        # Generate a unique ID for the vector
        vector_id = f"{doc_type}_{chunk.get('index', i)}"
        
        # Build metadata strictly conforming to requirements
        metadata = {
            "source": source,
            "section": chunk.get("section", "general"),
            "text": chunk["text"],
            "token_count": chunk.get("token_count", 0)
        }
        
        vectors.append({
            "id": vector_id,
            "values": emb,
            "metadata": metadata
        })

    # Upsert in batches of 100
    batch_size = 100
    upserted_count = 0
    for i in range(0, len(vectors), batch_size):
        batch = vectors[i:i + batch_size]
        index.upsert(vectors=batch, namespace=user_id)
        upserted_count += len(batch)

    return upserted_count

def search_index(
    user_id: str,
    doc_type: str = None,
    query_embedding: list[float] = None,
    top_k: int = 5,
) -> list[dict]:
    """
    Search a user's Pinecone namespace.
    
    Filters: doc_type can be 'resume', 'jd' or None (for both).
    """
    index = _get_index()
    if not index:
        return []

    filter_dict = {}
    if doc_type:
        source = "resume" if doc_type == "resume" else "job_description"
        filter_dict["source"] = source

    try:
        results = index.query(
            namespace=user_id,
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True,
            filter=filter_dict if filter_dict else None
        )
        
        formatted_results = []
        for match in results.get("matches", []):
            formatted_results.append({
                "text": match["metadata"]["text"],
                "score": match.get("score", 0.0),
                "doc_type": "resume" if match["metadata"]["source"] == "resume" else "jd",
                "section": match["metadata"].get("section", "general")
            })
            
        return formatted_results
    except Exception as e:
        logger.error(f"Pinecone query failed: {e}")
        return []

def index_exists(user_id: str, doc_type: str) -> bool:
    """We check if any vectors exist for the user and doc type."""
    index = _get_index()
    if not index:
        return False
        
    source = "resume" if doc_type == "resume" else "job_description"
    try:
        # Dummy query with non-zero vector to ensure valid cosine calculation
        settings = get_settings()
        dummy_vec = [0.1] * settings.EMBEDDING_DIMENSIONS
        
        res = index.query(
            namespace=user_id,
            vector=dummy_vec,
            top_k=1,
            filter={"source": source}
        )
        return len(res.get("matches", [])) > 0
    except Exception as e:
        logger.error(f"index_exists query failed: {e}")
        return False

def get_all_chunks(user_id: str, doc_type: str) -> list[dict]:
    """
    Since Pinecone can't easily download all texts without querying, 
    we could simulate this with an empty query (which isn't ideal), 
    or just use the dummy query above. However, the exact text logic 
    (for full resume fetching) in app might need a database.
    For now, query top 100 to get a "summary".
    """
    index = _get_index()
    if not index:
        return []

    source = "resume" if doc_type == "resume" else "job_description"
    settings = get_settings()
    dummy_vec = [0.1] * settings.EMBEDDING_DIMENSIONS
    
    try:
        res = index.query(
            namespace=user_id,
            vector=dummy_vec,
            top_k=100,
            include_metadata=True,
            filter={"source": source}
        )
        
        return [
            {"text": m["metadata"]["text"]}
            for m in res.get("matches", [])
        ]
    except Exception as e:
        logger.error(f"get_all_chunks query failed: {e}")
        return []

def delete_document_vectors(user_id: str, doc_type: str) -> bool:
    """
    Deletes all vector embeddings tied to a specific user and doc_type natively 
    using Pinecone's filter API without downloading chunk IDs.
    """
    index = _get_index()
    if not index:
        return False
        
    source = "resume" if doc_type == "resume" else "job_description"
    try:
        index.delete(
            namespace=user_id,
            filter={"source": source}
        )
        logger.info(f"Successfully wiped vectors for {source} under namespace {user_id}")
        return True
    except Exception as e:
        # Check if the error is just Pinecone complaining the namespace doesn't exist yet
        # If it doesn't exist, our deletion goal is already computationally satisfied!
        if "Namespace not found" in str(e):
            logger.info(f"Namespace {user_id} already missing {source} vectors. Deletion satisfied.")
            return True
            
        logger.error(f"Failed to cleanly delete Pinecone vectors for {source}: {e}")
        raise ValueError(f"Vector wipe partially failed: {e}")

