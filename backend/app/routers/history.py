"""History router — retrieve past session data and weak area analysis."""

import logging
from fastapi import APIRouter, Depends, Query
import aiosqlite

from app.dependencies import get_current_user_id
from app.models.database import get_db_path
from app.models.schemas import (
    HistoryResponse,
    SessionRecord,
    InteractionRecord,
    WeakAreaInfo,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/history", response_model=HistoryResponse)
async def get_history(
    session_id: str | None = Query(None, description="Filter by session ID"),
    user_id: str = Depends(get_current_user_id),
):
    """Retrieve interview history for the authenticated user."""
    async with aiosqlite.connect(get_db_path()) as db:
        db.row_factory = aiosqlite.Row

        # Get sessions
        if session_id:
            sessions_rows = await db.execute(
                "SELECT * FROM sessions WHERE user_id = ? AND session_id = ? ORDER BY started_at DESC",
                (user_id, session_id),
            )
        else:
            sessions_rows = await db.execute(
                "SELECT * FROM sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT 20",
                (user_id,),
            )
        sessions = await sessions_rows.fetchall()

        result_sessions = []
        for session in sessions:
            # Get interactions for this session
            interactions_rows = await db.execute(
                """SELECT question_id, question, answer, score, feedback, difficulty, topic, timestamp
                   FROM interactions WHERE session_id = ? AND user_id = ?
                   ORDER BY timestamp ASC""",
                (session["session_id"], user_id),
            )
            interactions = await interactions_rows.fetchall()

            interaction_records = []
            scores = []
            for inter in interactions:
                interaction_records.append(
                    InteractionRecord(
                        question_id=inter["question_id"],
                        question=inter["question"],
                        answer=inter["answer"],
                        score=inter["score"],
                        feedback=inter["feedback"],
                        difficulty=inter["difficulty"],
                        topic=inter["topic"] or "",
                        timestamp=inter["timestamp"],
                    )
                )
                if inter["score"] is not None:
                    scores.append(inter["score"])

            # Get weak areas for this session
            weak_rows = await db.execute(
                "SELECT DISTINCT topic FROM weak_areas WHERE session_id = ? AND user_id = ?",
                (session["session_id"], user_id),
            )
            weak_areas = [row["topic"] for row in await weak_rows.fetchall()]

            avg_score = round(sum(scores) / len(scores), 1) if scores else None

            result_sessions.append(
                SessionRecord(
                    session_id=session["session_id"],
                    started_at=session["started_at"],
                    interactions=interaction_records,
                    average_score=avg_score,
                    weak_areas=weak_areas,
                )
            )

        # Get overall weak areas
        overall_weak_rows = await db.execute(
            """SELECT topic, COUNT(*) as count, AVG(score) as avg_score
               FROM weak_areas WHERE user_id = ?
               GROUP BY topic ORDER BY count DESC LIMIT 10""",
            (user_id,),
        )
        overall_weak = [row["topic"] for row in await overall_weak_rows.fetchall()]

    return HistoryResponse(
        sessions=result_sessions,
        overall_weak_areas=overall_weak,
    )


@router.get("/weak-areas")
async def get_weak_areas(
    user_id: str = Depends(get_current_user_id),
):
    """Get detailed weak area analysis for the user."""
    async with aiosqlite.connect(get_db_path()) as db:
        db.row_factory = aiosqlite.Row

        rows = await db.execute(
            """SELECT topic, COUNT(*) as count, ROUND(AVG(score), 1) as avg_score
               FROM weak_areas WHERE user_id = ?
               GROUP BY topic ORDER BY count DESC LIMIT 15""",
            (user_id,),
        )
        weak_areas = [
            WeakAreaInfo(
                topic=row["topic"],
                count=row["count"],
                avg_score=row["avg_score"],
            )
            for row in await rows.fetchall()
        ]

    return {"weak_areas": weak_areas}


@router.get("/documents")
async def get_documents(
    user_id: str = Depends(get_current_user_id),
):
    """Get list of uploaded documents for the user."""
    async with aiosqlite.connect(get_db_path()) as db:
        db.row_factory = aiosqlite.Row

        rows = await db.execute(
            "SELECT id, doc_type, filename, summary, uploaded_at FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC",
            (user_id,),
        )
        documents = [dict(row) for row in await rows.fetchall()]

    return {"documents": documents}
