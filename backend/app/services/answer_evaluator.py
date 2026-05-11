"""Answer evaluator — scores and provides feedback on user answers."""

import logging
from app.services.llm import call_llm
from app.prompts.evaluation_prompts import (
    EVALUATION_SYSTEM_PROMPT,
    build_evaluation_user_prompt,
)

logger = logging.getLogger(__name__)


async def evaluate_answer(
    question: str,
    answer: str,
    difficulty: str = "intermediate",
    retrieved_context: list[str] | None = None,
) -> dict:
    """
    Evaluate a user's answer to an interview question.

    Args:
        question: The interview question asked
        answer: The user's answer
        difficulty: Current difficulty level
        retrieved_context: Relevant context chunks for grading

    Returns:
        {
            "score": float (0-10),
            "correctness": float (0-10),
            "depth": float (0-10),
            "clarity": float (0-10),
            "feedback": str,
            "improvement": str,
            "weak_areas": [str],
            "follow_up_question": str | None,
        }
    """
    context_text = ""
    if retrieved_context:
        context_text = "\n---\n".join(retrieved_context[:5])

    user_prompt = build_evaluation_user_prompt(
        question=question,
        answer=answer,
        difficulty=difficulty,
        context=context_text,
    )

    result = await call_llm(
        system_prompt=EVALUATION_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        temperature=0.3,
    )

    # Validate and normalize scores
    evaluation = {
        "score": _clamp_score(result.get("score", 5)),
        "feedback": result.get("feedback", "No feedback available."),
        "model_answer": result.get("model_answer", "No ideal answer available."),
        "weak_areas": result.get("weak_areas", []),
    }

    return evaluation


def _clamp_score(value) -> float:
    """Ensure score is a float between 0 and 10."""
    try:
        score = float(value)
        return max(0.0, min(10.0, score))
    except (TypeError, ValueError):
        return 5.0
