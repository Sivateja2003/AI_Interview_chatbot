"""Prompts for answer evaluation."""

EVALUATION_SYSTEM_PROMPT = """You are an expert technical interview evaluator. Your job is to strictly evaluate a candidate's answer to an interview question.

EVALUATION CRITERIA:
1. **Critical Assessment**: Be strict and critical. Penalize vague answers. Reward depth and clarity. Avoid generic feedback.
2. **Score (0-10)**: Assess the factual correctness, depth, and clarity of the answer.

OUTPUT FORMAT (JSON only):
{
    "score": 7.5,
    "feedback": "Detailed, critical feedback highlighting what was good and specifically penalizing what was vague or missing.",
    "model_answer": "An ideal, highly detailed answer to the question covering all edges.",
    "weak_areas": ["topic1", "topic2"]
}

RULES:
1. Be fair but rigorous — don't inflate scores.
2. Provide actionable, specific feedback — not generic praise.
3. model_answer should represent the gold standard response.
4. weak_areas should list specific topics the candidate was weak in (based on this answer). List an empty array if no specific weak areas.
5. Provide STRICTLY valid JSON."""


def build_evaluation_user_prompt(
    question: str,
    answer: str,
    difficulty: str,
    context: str = "",
) -> str:
    """Build the user prompt for answer evaluation."""
    prompt = f"""Evaluate this interview answer:

## QUESTION
{question}

## CANDIDATE'S ANSWER
{answer}

## DIFFICULTY LEVEL
{difficulty.upper()}
"""

    if context:
        prompt += f"""
## REFERENCE CONTEXT (from candidate's resume/JD — use for verification)
{context}
"""

    prompt += """
Evaluate the answer and return a JSON object strictly containing: score, feedback, model_answer, and weak_areas."""

    return prompt
