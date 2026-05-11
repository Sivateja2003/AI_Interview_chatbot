"""Interview router — question generation, answer evaluation, difficulty adjustment."""

import uuid
import json
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
import aiosqlite

from app.dependencies import get_current_user_id
from app.models.schemas import (
    GenerateQuestionRequest,
    QuestionResponse,
    EvaluateAnswerRequest,
    EvaluationResponse,
    AdjustDifficultyRequest,
    RetrievedSource,
    Difficulty,
)
from app.models.database import get_db_path
from app.services.question_generator import generate_question, generate_follow_up
from app.services.answer_evaluator import evaluate_answer
from app.services.difficulty import infer_initial_difficulty, adapt_difficulty
from app.services.vector_store import index_exists

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/generate-question", response_model=QuestionResponse)
async def generate_interview_question(
    request: GenerateQuestionRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Generate a context-aware interview question using RAG."""
    try:
        # Check if user has uploaded documents
        if not index_exists(user_id, "resume") and not index_exists(user_id, "jd"):
            raise HTTPException(
                status_code=400,
                detail="Please upload a resume or job description first.",
            )

        # Create or get session
        session_id = request.session_id or str(uuid.uuid4())[:12]
        now = datetime.now(timezone.utc).isoformat()

        async with aiosqlite.connect(get_db_path()) as db:
            db.row_factory = aiosqlite.Row
            # Create session if new
            existing = await db.execute(
                "SELECT session_id FROM sessions WHERE session_id = ?", (session_id,)
            )
            if not await existing.fetchone():
                # Infer initial difficulty
                difficulty = request.difficulty or Difficulty(
                    infer_initial_difficulty(user_id)
                )
                await db.execute(
                    "INSERT INTO sessions (session_id, user_id, started_at, difficulty) VALUES (?, ?, ?, ?)",
                    (session_id, user_id, now, difficulty.value),
                )
                await db.commit()
            else:
                if request.difficulty:
                    difficulty = request.difficulty
                else:
                    row = await db.execute(
                        "SELECT difficulty FROM sessions WHERE session_id = ?",
                        (session_id,),
                    )
                    row_data = await row.fetchone()
                    difficulty = Difficulty(row_data["difficulty"]) if row_data else Difficulty.INTERMEDIATE

            # Get session history for context
            history_rows = await db.execute(
                """SELECT question, answer, score, topic FROM interactions
                   WHERE session_id = ? ORDER BY timestamp ASC""",
                (session_id,),
            )
            session_history = [dict(row) for row in await history_rows.fetchall()]

        # Generate question
        result = await generate_question(
            user_id=user_id,
            difficulty=difficulty.value,
            session_history=session_history,
            focus_area=request.focus_area,
        )

        # Save the question to interactions
        async with aiosqlite.connect(get_db_path()) as db:
            await db.execute(
                """INSERT INTO interactions
                   (session_id, user_id, question_id, question, difficulty, topic, sources_json, timestamp)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    session_id,
                    user_id,
                    result["question_id"],
                    result["question"],
                    difficulty.value,
                    result["topic"],
                    json.dumps(result["sources"][:3]),
                    now,
                ),
            )
            await db.commit()

        return QuestionResponse(
            session_id=session_id,
            question_id=result["question_id"],
            question=result["question"],
            difficulty=difficulty,
            topic=result["topic"],
            sources=[
                RetrievedSource(
                    text=s.get("text", ""),
                    score=s.get("score", 0.0),
                    doc_type=s.get("doc_type", ""),
                    chunk_index=s.get("chunk_index", 0),
                )
                for s in result["sources"][:5]
            ],
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        logger.error(f"Generate question failed: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/evaluate-answer", response_model=EvaluationResponse)
async def evaluate_interview_answer(
    request: EvaluateAnswerRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Evaluate the user's answer and provide feedback."""
    # Evaluate
    evaluation = await evaluate_answer(
        question=request.question,
        answer=request.answer,
        difficulty=request.difficulty.value,
        retrieved_context=request.retrieved_context,
    )

    now = datetime.now(timezone.utc).isoformat()

    # Get recent scores for difficulty adaptation
    async with aiosqlite.connect(get_db_path()) as db:
        db.row_factory = aiosqlite.Row

        # Update the interaction with answer and evaluation
        await db.execute(
            """UPDATE interactions SET answer = ?, score = ?, correctness = ?,
               depth = ?, clarity = ?, feedback = ?, improvement = ?, timestamp = ?
               WHERE question_id = ? AND user_id = ?""",
            (
                request.answer,
                evaluation["score"],
                None,
                None,
                None,
                evaluation["feedback"],
                evaluation.get("model_answer"),
                now,
                request.question_id,
                user_id,
            ),
        )

        # Track weak areas
        for topic in evaluation.get("weak_areas", []):
            await db.execute(
                "INSERT INTO weak_areas (user_id, topic, score, session_id, timestamp) VALUES (?, ?, ?, ?, ?)",
                (user_id, topic, evaluation["score"], request.session_id, now),
            )

        # Get recent scores for difficulty adaptation
        scores_row = await db.execute(
            """SELECT score FROM interactions
               WHERE session_id = ? AND score IS NOT NULL
               ORDER BY timestamp DESC LIMIT 3""",
            (request.session_id,),
        )
        recent_scores = [row["score"] for row in await scores_row.fetchall()]

        # Adapt difficulty
        current_diff = request.difficulty.value
        new_difficulty = adapt_difficulty(current_diff, recent_scores)

        # Update session difficulty
        await db.execute(
            "UPDATE sessions SET difficulty = ? WHERE session_id = ?",
            (new_difficulty, request.session_id),
        )

        await db.commit()

    return EvaluationResponse(
        question_id=request.question_id,
        score=evaluation["score"],
        feedback=evaluation["feedback"],
        model_answer=evaluation.get("model_answer", ""),
        weak_areas=evaluation.get("weak_areas", []),
        new_difficulty=Difficulty(new_difficulty),
    )


@router.post("/adjust-difficulty")
async def adjust_difficulty(
    request: AdjustDifficultyRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Manually adjust the interview difficulty."""
    async with aiosqlite.connect(get_db_path()) as db:
        db.row_factory = aiosqlite.Row
        row = await db.execute(
            "SELECT difficulty FROM sessions WHERE session_id = ? AND user_id = ?",
            (request.session_id, user_id),
        )
        session = await row.fetchone()

        if not session:
            raise HTTPException(status_code=404, detail="Session not found.")

        current = session["difficulty"]
        new_difficulty = adapt_difficulty(current, [], direction=request.direction.value)

        await db.execute(
            "UPDATE sessions SET difficulty = ? WHERE session_id = ?",
            (new_difficulty, request.session_id),
        )
        await db.commit()

    return {
        "previous_difficulty": current,
        "new_difficulty": new_difficulty,
        "session_id": request.session_id,
    }
