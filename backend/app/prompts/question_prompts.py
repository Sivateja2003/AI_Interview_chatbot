"""Prompts for interview question generation."""

QUESTION_SYSTEM_PROMPT = """You are an expert technical interviewer. Your job is to generate ONE high-quality interview question based on the candidate's resume and the job description provided.

RULES:
1. The question MUST be specific to the candidate's background — never generic
2. The question MUST be relevant to the job requirements
3. The question difficulty MUST match the specified level
4. Do NOT repeat questions from the conversation history
5. Vary topics across: technical skills, projects, system design, behavioral, problem-solving
6. For "beginner": focus on fundamentals, definitions, simple scenarios
7. For "intermediate": focus on implementation details, tradeoffs, real-world application
8. For "advanced": focus on system design, optimization, edge cases, architectural decisions

OUTPUT FORMAT (JSON only):
{
    "question": "Your interview question here",
    "topic": "The main topic/skill area (e.g., 'React', 'System Design', 'Python')",
    "expected_depth": "Brief description of what a good answer should cover"
}"""


def build_question_user_prompt(
    resume_summary: str,
    jd_summary: str,
    retrieved_context: str,
    difficulty: str,
    history: str = "",
    focus_area: str | None = None,
) -> str:
    """Build the user prompt for question generation."""
    prompt = f"""Generate an interview question with the following context:

## DIFFICULTY LEVEL
{difficulty.upper()}

## CANDIDATE'S RESUME (Key Sections)
{resume_summary}

## JOB DESCRIPTION (Key Requirements)
{jd_summary}

## RETRIEVED CONTEXT (Most Relevant Sections)
{retrieved_context}
"""

    if history:
        prompt += f"""
## PREVIOUS QUESTIONS IN THIS SESSION (Do NOT repeat)
{history}
"""

    if focus_area:
        prompt += f"""
## REQUESTED FOCUS AREA
Focus the question on: {focus_area}
"""

    prompt += """
Generate ONE specific, context-aware interview question. Return as JSON with "question", "topic", and "expected_depth" fields."""

    return prompt


def build_followup_user_prompt(
    previous_question: str,
    previous_answer: str,
    score: float,
    difficulty: str,
    context: str,
) -> str:
    """Build prompt for follow-up question generation."""
    return f"""Generate a follow-up interview question based on this previous exchange:

## PREVIOUS QUESTION
{previous_question}

## CANDIDATE'S ANSWER
{previous_answer}

## SCORE: {score}/10

## DIFFICULTY: {difficulty.upper()}

## RELEVANT CONTEXT
{context}

RULES:
- If score was LOW (< 5): Ask a simpler follow-up to test foundational understanding
- If score was MEDIUM (5-7): Dig deeper into the same topic to test deeper knowledge
- If score was HIGH (> 7): Ask a more challenging follow-up or pivot to a related advanced topic
- The follow-up should build on the previous answer — reference specific points they made

Return as JSON with "question", "topic", and "expected_depth" fields."""
