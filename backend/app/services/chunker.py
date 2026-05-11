"""Semantic-aware text chunker with configurable token size and overlap."""

import re
import tiktoken
from app.config import get_settings


def chunk_text(
    text: str,
    chunk_size: int | None = None,
    overlap: int | None = None,
) -> list[dict]:
    """
    Chunk text using a semantic-aware strategy:
    1. Split by natural boundaries (paragraphs, sections)
    2. Merge small chunks, split large ones to target chunk_size tokens
    3. Apply overlap between consecutive chunks

    Returns a list of dicts: [{"text": str, "index": int, "token_count": int}]
    """
    settings = get_settings()
    chunk_size = chunk_size or settings.CHUNK_SIZE_TOKENS
    overlap = overlap or settings.CHUNK_OVERLAP_TOKENS

    encoder = tiktoken.get_encoding("cl100k_base")

    # Step 1: Split by semantic boundaries
    sections = _split_by_sections(text)

    # Step 2: Process sections into target-sized chunks
    chunks = []
    current_chunk = ""
    current_tokens = 0

    for section in sections:
        section_tokens = len(encoder.encode(section))

        if section_tokens > chunk_size:
            # Flush current buffer
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
                current_chunk = ""
                current_tokens = 0

            # Split large section by sentences
            sub_chunks = _split_large_section(section, chunk_size, encoder)
            chunks.extend(sub_chunks)
        elif current_tokens + section_tokens > chunk_size:
            # Current buffer full — flush and start new
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
            current_chunk = section
            current_tokens = section_tokens
        else:
            # Add to current buffer
            current_chunk += ("\n\n" if current_chunk else "") + section
            current_tokens += section_tokens

    # Flush remaining
    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    # Step 3: Apply overlap
    if overlap > 0 and len(chunks) > 1:
        chunks = _apply_overlap(chunks, overlap, encoder)

    # Build result
    result = []
    for i, chunk in enumerate(chunks):
        section_name = _infer_section(chunk)
        result.append({
            "text": chunk,
            "section": section_name,
            "index": i,
            "token_count": len(encoder.encode(chunk)),
        })

    return result

def _infer_section(text: str) -> str:
    """Infer if chunk text belongs to skills, projects, experience, or general."""
    text_lower = text.lower()
    if 'experience' in text_lower or 'employment' in text_lower or 'work history' in text_lower:
        return 'experience'
    elif 'project' in text_lower:
        return 'projects'
    elif 'skill' in text_lower or 'technologies' in text_lower or 'frameworks' in text_lower:
        return 'skills'
    elif 'education' in text_lower or 'degree' in text_lower or 'university' in text_lower:
        return 'education'
    return 'general'


def _split_by_sections(text: str) -> list[str]:
    """Split text by double newlines, headers, or section markers."""
    # Split by double newlines or markdown-style headers
    pattern = r'\n\s*\n|(?=^#{1,3}\s)', 
    parts = re.split(r'\n\s*\n', text)
    sections = [p.strip() for p in parts if p.strip()]
    return sections


def _split_large_section(
    text: str, chunk_size: int, encoder: tiktoken.Encoding
) -> list[str]:
    """Split a section that exceeds chunk_size by sentences."""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current = ""
    current_tokens = 0

    for sentence in sentences:
        sent_tokens = len(encoder.encode(sentence))
        if current_tokens + sent_tokens > chunk_size and current:
            chunks.append(current.strip())
            current = sentence
            current_tokens = sent_tokens
        else:
            current += (" " if current else "") + sentence
            current_tokens += sent_tokens

    if current.strip():
        chunks.append(current.strip())

    return chunks


def _apply_overlap(
    chunks: list[str], overlap: int, encoder: tiktoken.Encoding
) -> list[str]:
    """Add overlap tokens from the end of each chunk to the start of the next."""
    result = [chunks[0]]

    for i in range(1, len(chunks)):
        prev_tokens = encoder.encode(chunks[i - 1])
        overlap_tokens = prev_tokens[-overlap:] if len(prev_tokens) > overlap else prev_tokens
        overlap_text = encoder.decode(overlap_tokens)
        result.append(overlap_text + " " + chunks[i])

    return result
