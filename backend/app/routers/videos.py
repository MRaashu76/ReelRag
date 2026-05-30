"""
/videos endpoint - return stored video metadata
"""
from fastapi import APIRouter, HTTPException
from app.services.metadata_store import get_metadata_store
from app.models.schemas import VideoMetadata

router = APIRouter()


@router.get("/videos", response_model=list[VideoMetadata])
async def get_videos():
    """Return metadata for all analyzed videos."""
    store = get_metadata_store()
    videos = store.get_all_videos()
    return sorted(videos, key=lambda v: v.video_id)


@router.get("/videos/{video_id}", response_model=VideoMetadata)
async def get_video(video_id: str):
    """Return metadata for a specific video."""
    store = get_metadata_store()
    video = store.get_video(video_id.upper())
    if not video:
        raise HTTPException(status_code=404, detail=f"Video {video_id} not found")
    return video
