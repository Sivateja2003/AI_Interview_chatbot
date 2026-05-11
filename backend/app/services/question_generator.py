"""Question generator — RAG-based interview question generation."""

import uuid
import logging
from app.services.retriever import retrieve_for_question_gen
from app.services.llm import call_llm
from app.prompts.question_prompts import (
    QUESTION_SYSTEM_PROMPT,
    build_question_user_prompt,
    build_followup_user_prompt,
)

logger = logging.getLogger(__name__)


async def generate_question(
    user_id: str,
    difficulty: str = "intermediate",
    session_history: list[dict] | None = None,
    focus_area: str | None = None,
) -> dict:
    """
    Generate a context-aware interview question using RAG.

    Args:
        user_id: Authenticated user's ID
        difficulty: 'beginner', 'intermediate', or 'advanced'
        session_history: Previous Q&A pairs in this session
        focus_area: Optional topic to focus on

    Returns:
        {
            "question_id": str,
            "question": str,
            "topic": str,
            "difficulty": str,
            "sources": [{"text", "score", "doc_type", "chunk_index"}],
        }
    """
    # Retrieve context from vector stores
    topic_hint = focus_area or ""
    if session_history:
        # Use recent topics to diversify questions
        recent_topics = [h.get("topic", "") for h in session_history[-3:]]
        topic_hint += " " + " ".join(recent_topics)

    context = await retrieve_for_question_gen(user_id, topic_hint.strip())

    # Build conversation history summary
    history_text = ""
    if session_history:
        history_parts = []
        for h in session_history[-5:]:  # Last 5 interactions
            history_parts.append(
                f"Q: {h.get('question', '')}\n"
                f"A: {h.get('answer', 'Not answered')}\n"
                f"Score: {h.get('score', 'N/A')}/10"
            )
        history_text = "\n---\n".join(history_parts)

    # Build prompt
    user_prompt = build_question_user_prompt(
        resume_summary=context["resume_summary"],
        jd_summary=context["jd_summary"],
        retrieved_context=_format_chunks(context["resume_chunks"] + context["jd_chunks"]),
        difficulty=difficulty,
        history=history_text,
        focus_area=focus_area,
    )

    # Call LLM
    result = await call_llm(
        system_prompt=QUESTION_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        temperature=0.8,
    )

    question_id = str(uuid.uuid4())[:8]

    # Combine sources
    all_sources = context["resume_chunks"] + context["jd_chunks"]

    return {
        "question_id": question_id,
        "question": result.get("question", "Could not generate question."),
        "topic": result.get("topic", "general"),
        "difficulty": difficulty,
        "sources": all_sources[:5],
    }


async def generate_follow_up(
    user_id: str,
    previous_question: str,
    previous_answer: str,
    evaluation_score: float,
    difficulty: str = "intermediate",
) -> dict:
    """Generate a follow-up question based on the previous Q&A."""
    context = await retrieve_for_question_gen(user_id, previous_question)

    user_prompt = build_followup_user_prompt(
        previous_question=previous_question,
        previous_answer=previous_answer,
        score=evaluation_score,
        difficulty=difficulty,
        context=_format_chunks(context["resume_chunks"] + context["jd_chunks"]),
    )

    result = await call_llm(
        system_prompt=QUESTION_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        temperature=0.8,
    )

    question_id = str(uuid.uuid4())[:8]
    all_sources = context["resume_chunks"] + context["jd_chunks"]

    return {
        "question_id": question_id,
        "question": result.get("question", "Could not generate follow-up."),
        "topic": result.get("topic", "general"),
        "difficulty": difficulty,
        "sources": all_sources[:5],
    }


def _format_chunks(chunks: list[dict]) -> str:
    """Format retrieved chunks into a text block for the prompt."""
    parts = []
    for i, chunk in enumerate(chunks[:5]):
        source = chunk.get("doc_type", "unknown")
        parts.append(f"[Source {i+1} — {source}]\n{chunk['text']}")
    return "\n\n".join(parts)
