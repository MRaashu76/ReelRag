"""
/analyze endpoint - processes YouTube and Instagram videos
"""
import asyncio
import logging
from fastapi import APIRouter, BackgroundTasks, HTTPException

from app.models.schemas import AnalyzeRequest, AnalyzeResponse, VideoMetadata
from app.services.youtube_service import get_youtube_metadata, get_youtube_transcript
from app.services.instagram_service import get_instagram_metadata, get_instagram_transcript
from app.services.vector_store import get_vector_store
from app.services.metadata_store import get_metadata_store

logger = logging.getLogger(__name__)
router = APIRouter()

# Track processing state
_processing_state = {"status": "idle", "progress": "", "error": ""}


def get_analysis_state() -> dict:
    return _processing_state.copy()


def _update_state(status: str, progress: str = "", error: str = ""):
    _processing_state["status"] = status
    _processing_state["progress"] = progress
    _processing_state["error"] = error


def detect_and_process(url: str, video_id: str) -> VideoMetadata:
    if "youtube.com" in url or "youtu.be" in url:
        _update_state("processing", f"Extracting YouTube metadata for Video {video_id}...")
        meta = get_youtube_metadata(url)
        transcript = get_youtube_transcript(url)
        source = "youtube"
    elif "instagram.com" in url:
        _update_state("processing", f"Extracting Instagram metadata for Video {video_id}...")
        meta = get_instagram_metadata(url)
        transcript = get_instagram_transcript(url)
        source = "instagram"
    else:
        raise ValueError(f"Unsupported URL format: {url}")
        
    return VideoMetadata(
        video_id=video_id,
        source=source,
        url=url,
        transcript=transcript,
        **meta,
    )


def _process_videos(video_a_url: str, video_b_url: str):
    """Background task: extract metadata, transcripts, and index into ChromaDB."""
    try:
        _update_state("processing", "Starting video analysis...")
        logger.info("Starting video analysis pipeline")

        # ── Video A ───────────────────────────────────────────────────────────
        video_a = detect_and_process(video_a_url, "A")
        video_a.engagement_rate = video_a.calculate_engagement_rate()

        # ── Video B ───────────────────────────────────────────────────────────
        video_b = detect_and_process(video_b_url, "B")
        video_b.engagement_rate = video_b.calculate_engagement_rate()

        # ── Store metadata ────────────────────────────────────────────────────
        _update_state("processing", "Storing metadata...")
        store = get_metadata_store()
        store.save_video(video_a)
        store.save_video(video_b)

        # ── Index transcripts ─────────────────────────────────────────────────
        vs = get_vector_store()

        if video_a.transcript:
            _update_state("processing", f"Indexing {video_a.source} transcript for A...")
            vs.ingest_transcript(video_a.transcript, video_id="A", source=video_a.source)
        else:
            logger.warning(f"No transcript available for {video_a.source} video A")

        if video_b.transcript:
            _update_state("processing", f"Indexing {video_b.source} transcript for B...")
            vs.ingest_transcript(video_b.transcript, video_id="B", source=video_b.source)
        else:
            logger.warning(f"No transcript available for {video_b.source} video B")

        _update_state("completed", "Analysis complete!")
        logger.info("Video analysis pipeline completed successfully")

    except Exception as e:
        logger.error(f"Video analysis failed: {e}", exc_info=True)
        _update_state("error", "", str(e))


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_videos(
    request: AnalyzeRequest,
    background_tasks: BackgroundTasks,
):
    """
    Start video analysis pipeline. Returns immediately; processing happens in background.
    Poll GET /api/analyze/status for progress.
    """
    if _processing_state["status"] == "processing":
        raise HTTPException(status_code=409, detail="Analysis already in progress")

    _update_state("processing", "Starting analysis...")

    background_tasks.add_task(
        _process_videos,
        request.video_a_url,
        request.video_b_url,
    )

    return AnalyzeResponse(status="processing", message="Analysis started")


@router.get("/analyze/status")
async def get_status():
    """Poll analysis progress."""
    return get_analysis_state()
