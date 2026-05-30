"""
Data models for the RAG Video Comparison Platform
"""
from pydantic import BaseModel, HttpUrl, field_validator
from typing import Optional
from datetime import datetime


class VideoMetadata(BaseModel):
    video_id: str  # "A" or "B"
    title: str
    creator_name: str
    follower_count: Optional[int] = None
    views: Optional[int] = None
    likes: Optional[int] = None
    comments: Optional[int] = None
    upload_date: Optional[str] = None
    duration_seconds: Optional[float] = None
    hashtags: list[str] = []
    transcript: Optional[str] = None
    engagement_rate: Optional[float] = None
    source: str  # "youtube" or "instagram"
    url: str

    def calculate_engagement_rate(self) -> Optional[float]:
        if self.views and self.views > 0 and self.likes is not None and self.comments is not None:
            return round((self.likes + self.comments) / self.views * 100, 2)
        return None


class AnalyzeRequest(BaseModel):
    video_a_url: str
    video_b_url: str

    @field_validator("video_a_url", "video_b_url")
    @classmethod
    def validate_video_url(cls, v: str) -> str:
        if "youtube.com" not in v and "youtu.be" not in v and "instagram.com" not in v:
            raise ValueError("Must be a valid YouTube or Instagram URL")
        return v


class AnalyzeResponse(BaseModel):
    status: str
    message: Optional[str] = None


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"


class ChunkMetadata(BaseModel):
    video_id: str
    chunk_id: int
    content: str
    source: str  # "youtube" or "instagram"


class AnalysisState(BaseModel):
    status: str  # "idle" | "processing" | "completed" | "error"
    progress: Optional[str] = None
    error: Optional[str] = None
