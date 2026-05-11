"""Embedding generation using Google Gemini."""

import google.generativeai as genai
from app.config import get_settings


_configured = False


def _ensure_configured():
    """Lazy-init Gemini configuration."""
    global _configured
    if not _configured:
        settings = get_settings()
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _configured = True


async def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generate embeddings for a list of texts using Gemini.
    """
    _ensure_configured()
    settings = get_settings()

    all_embeddings = []
    
    # Gemini API supports batch embedding via embed_content with a list of strings
    # But batch size limits might apply, let's process in batches of 100
    batch_size = 100

    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        result = genai.embed_content(
            model=settings.GEMINI_EMBEDDING_MODEL,
            content=batch,
            task_type="retrieval_document"
        )
        # result['embedding'] is a list of lists if batch > 1, or just a list if batch == 1
        # genai.embed_content returns {"embedding": [[...], [...]]} for lists
        batch_embeddings = result['embedding']
        if isinstance(batch_embeddings[0], float):
            # Single item
            all_embeddings.append(batch_embeddings)
        else:
            all_embeddings.extend(batch_embeddings)

    return all_embeddings


async def generate_single_embedding(text: str) -> list[float]:
    """Generate a single embedding vector for a text query."""
    _ensure_configured()
    settings = get_settings()
    
    result = genai.embed_content(
        model=settings.GEMINI_EMBEDDING_MODEL,
        content=text,
        task_type="retrieval_query"
    )
    return result['embedding']
