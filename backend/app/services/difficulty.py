"""Adaptive difficulty system — adjusts interview difficulty based on performance."""

import logging
from app.services.vector_store import get_all_chunks

logger = logging.getLogger(__name__)

DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"]


def infer_initial_difficulty(user_id: str) -> str:
    """
    Infer initial difficulty from resume content.
    Analyzes years of experience and skill complexity.
    """
    resume_chunks = get_all_chunks(user_id, "resume")
    if not resume_chunks:
        return "intermediate"  # Default

    full_text = " ".join([c["text"] for c in resume_chunks]).lower()

    # Estimate years of experience
    years = _extract_years_of_experience(full_text)

    # Check for advanced skill indicators
    advanced_indicators = [
        "architect", "lead", "senior", "principal", "staff",
        "distributed systems", "system design", "machine learning",
        "deep learning", "microservices", "kubernetes", "terraform",
        "phd", "published", "patent",
    ]
    advanced_count = sum(1 for ind in advanced_indicators if ind in full_text)

    # Decision logic
    if years >= 7 or advanced_count >= 4:
        return "advanced"
    elif years >= 3 or advanced_count >= 2:
        return "intermediate"
    else:
        return "beginner"


def adapt_difficulty(
    current_difficulty: str,
    recent_scores: list[float],
    direction: str | None = None,
) -> str:
    """
    Adapt difficulty based on recent performance or explicit direction.

    Args:
        current_difficulty: Current difficulty level
        recent_scores: Last N scores (0-10)
        direction: 'harder' or 'easier' for manual override

    Returns:
        New difficulty level
    """
    current_idx = DIFFICULTY_LEVELS.index(current_difficulty)

    # Manual override
    if direction == "harder":
        new_idx = min(current_idx + 1, len(DIFFICULTY_LEVELS) - 1)
        return DIFFICULTY_LEVELS[new_idx]
    elif direction == "easier":
        new_idx = max(current_idx - 1, 0)
        return DIFFICULTY_LEVELS[new_idx]

    # Automatic adaptation based on scores
    if not recent_scores:
        return current_difficulty

    avg_score = sum(recent_scores) / len(recent_scores)

    if avg_score >= 8.0 and len(recent_scores) >= 2:
        # Consistently high scores → increase difficulty
        new_idx = min(current_idx + 1, len(DIFFICULTY_LEVELS) - 1)
        logger.info(f"Difficulty UP: avg={avg_score:.1f}, {current_difficulty} → {DIFFICULTY_LEVELS[new_idx]}")
        return DIFFICULTY_LEVELS[new_idx]
    elif avg_score <= 4.0 and len(recent_scores) >= 2:
        # Consistently low scores → decrease difficulty
        new_idx = max(current_idx - 1, 0)
        logger.info(f"Difficulty DOWN: avg={avg_score:.1f}, {current_difficulty} → {DIFFICULTY_LEVELS[new_idx]}")
        return DIFFICULTY_LEVELS[new_idx]

    return current_difficulty


def _extract_years_of_experience(text: str) -> int:
    """Heuristically extract years of experience from resume text."""
    import re

    # Look for explicit mentions like "5+ years", "8 years of experience"
    patterns = [
        r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)',
        r'(?:experience|exp)\s*(?:of)?\s*(\d+)\+?\s*(?:years?|yrs?)',
        r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:in|of|working)',
    ]

    max_years = 0
    for pattern in patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            try:
                years = int(match)
                max_years = max(max_years, years)
            except ValueError:
                continue

    # Fallback: count date ranges (e.g., "2018 - 2023")
    if max_years == 0:
        date_ranges = re.findall(r'20(\d{2})\s*[-–]\s*(?:20(\d{2})|present|current)', text)
        total_years = 0
        for start, end in date_ranges:
            start_year = int(start)
            end_year = int(end) if end else 24  # current year approximation
            total_years += max(0, end_year - start_year)
        max_years = total_years

    return max_years
