"""Retriever — searches across user's resume and JD indices."""

from app.services.embeddings import generate_single_embedding
from app.services.vector_store import search_index, index_exists
from app.config import get_settings


async def retrieve(
    user_id: str,
    query: str,
    top_k: int | None = None,
    doc_types: list[str] | None = None,
) -> list[dict]:
    """
    Retrieve relevant chunks from the user's vector stores.

    Args:
        user_id: The authenticated user's ID
        query: Search query text
        top_k: Number of results per doc_type (default from settings)
        doc_types: Which document types to search (default: both)

    Returns:
        List of {"text", "score", "doc_type", "chunk_index"} sorted by score
    """
    settings = get_settings()
    top_k = top_k or settings.TOP_K
    doc_types = doc_types or ["resume", "jd"]

    # Generate query embedding
    query_embedding = await generate_single_embedding(query)

    # Search across all specified doc types
    all_results = []
    for doc_type in doc_types:
        if index_exists(user_id, doc_type):
            results = search_index(user_id, doc_type, query_embedding, top_k)
            all_results.extend(results)

    # Sort by score (descending) and limit
    all_results.sort(key=lambda x: x["score"], reverse=True)
    return all_results[:top_k]


async def retrieve_for_question_gen(user_id: str, topic_hint: str = "") -> dict:
    """
    Retrieve context specifically for question generation.
    Gets chunks from both resume and JD, plus generates summaries.

    Returns:
        {
            "resume_chunks": [...],
            "jd_chunks": [...],
            "resume_summary": str,
            "jd_summary": str,
        }
    """
    settings = get_settings()
    top_k = settings.TOP_K

    # Use a broad query if no specific topic
    query = topic_hint or "key skills experience projects responsibilities requirements"
    query_embedding = await generate_single_embedding(query)

    resume_chunks = []
    jd_chunks = []

    if index_exists(user_id, "resume"):
        resume_chunks = search_index(user_id, "resume", query_embedding, top_k)

    if index_exists(user_id, "jd"):
        jd_chunks = search_index(user_id, "jd", query_embedding, top_k)

    # Create summaries from top chunks
    resume_summary = _summarize_chunks(resume_chunks) if resume_chunks else "No resume uploaded."
    jd_summary = _summarize_chunks(jd_chunks) if jd_chunks else "No job description uploaded."

    return {
        "resume_chunks": resume_chunks,
        "jd_chunks": jd_chunks,
        "resume_summary": resume_summary,
        "jd_summary": jd_summary,
    }


def _summarize_chunks(chunks: list[dict]) -> str:
    """Create a concatenated summary from chunk texts."""
    texts = [c["text"] for c in chunks[:5]]
    return "\n---\n".join(texts)
