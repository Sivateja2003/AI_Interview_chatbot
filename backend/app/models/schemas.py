"""Pydantic request/response schemas for all API endpoints."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


# --- Enums ---

class DocType(str, Enum):
    RESUME = "resume"
    JD = "jd"


class Difficulty(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class DifficultyDirection(str, Enum):
    HARDER = "harder"
    EASIER = "easier"


# --- Request Models ---

class GenerateQuestionRequest(BaseModel):
    session_id: Optional[str] = None
    difficulty: Optional[Difficulty] = None
    focus_area: Optional[str] = None


class EvaluateAnswerRequest(BaseModel):
    session_id: str
    question_id: str
    question: str
    answer: str
    difficulty: Difficulty = Difficulty.INTERMEDIATE
    retrieved_context: Optional[list[str]] = None


class AdjustDifficultyRequest(BaseModel):
    session_id: str
    direction: DifficultyDirection


# --- Response Models ---

class UploadResponse(BaseModel):
    message: str
    doc_type: DocType
    filename: str
    summary: str
    chunks_created: int


class RetrievedSource(BaseModel):
    text: str
    score: float
    doc_type: str
    chunk_index: int


class QuestionResponse(BaseModel):
    session_id: str
    question_id: str
    question: str
    difficulty: Difficulty
    topic: str
    sources: list[RetrievedSource]
    follow_up: Optional[str] = None


class EvaluationResponse(BaseModel):
    question_id: str
    score: float = Field(ge=0, le=10)
    feedback: str
    model_answer: str
    weak_areas: list[str]
    new_difficulty: Difficulty


class InteractionRecord(BaseModel):
    question_id: str
    question: str
    answer: Optional[str] = None
    score: Optional[float] = None
    feedback: Optional[str] = None
    difficulty: Difficulty
    topic: str
    timestamp: str


class SessionRecord(BaseModel):
    session_id: str
    started_at: str
    interactions: list[InteractionRecord]
    average_score: Optional[float] = None
    weak_areas: list[str] = []


class HistoryResponse(BaseModel):
    sessions: list[SessionRecord]
    overall_weak_areas: list[str] = []


class WeakAreaInfo(BaseModel):
    topic: str
    count: int
    avg_score: float
