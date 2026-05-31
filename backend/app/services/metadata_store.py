"""
Metadata store for video metadata.

- If SUPABASE_URL is set  → uses Supabase PostgreSQL (production).
- If SUPABASE_URL is unset → falls back to a local JSON file (development).
"""
import json
import logging
from pathlib import Path
from typing import Optional
from functools import lru_cache

from app.models.schemas import VideoMetadata
from app.services.supabase_client import get_supabase_client, SUPABASE_URL

logger = logging.getLogger(__name__)

# Local fallback path (next to this file's package root)
_FALLBACK_PATH = Path(__file__).parent.parent.parent / "metadata_store.json"


# ── Local JSON store ───────────────────────────────────────────────────────────

class _LocalMetadataStore:
    """Simple JSON-file-backed store for local development."""

    def __init__(self, path: Path = _FALLBACK_PATH):
        self._path = path
        logger.info(f"Using local JSON metadata store at {self._path}")

    def _load(self) -> dict:
        if self._path.exists():
            try:
                return json.loads(self._path.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                return {}
        return {}

    def _save(self, data: dict):
        self._path.write_text(
            json.dumps(data, indent=2, default=str), encoding="utf-8"
        )

    def save_video(self, metadata: VideoMetadata):
        data = self._load()
        data[metadata.video_id] = metadata.model_dump()
        self._save(data)
        logger.info(f"[local] Saved metadata for video_id={metadata.video_id}")

    def get_video(self, video_id: str) -> Optional[VideoMetadata]:
        data = self._load()
        doc = data.get(video_id)
        return VideoMetadata(**doc) if doc else None

    def get_all_videos(self) -> list[VideoMetadata]:
        data = self._load()
        return [VideoMetadata(**v) for v in data.values()]

    def clear(self):
        self._save({})
        logger.info("[local] Cleared all video metadata")

    def has_videos(self) -> bool:
        return bool(self._load())


# ── Supabase store ─────────────────────────────────────────────────────────────

class _SupabaseMetadataStore:
    """Supabase PostgreSQL-backed metadata store."""

    def __init__(self):
        self._client = get_supabase_client()
        logger.info("Using Supabase metadata store")

    def save_video(self, metadata: VideoMetadata):
        if not self._client:
            return
        doc = metadata.model_dump()
        # Supabase upsert requires the primary key (video_id)
        try:
            self._client.table("video_metadata").upsert(doc).execute()
            logger.info(f"Saved metadata for video_id={metadata.video_id} to Supabase")
        except Exception as e:
            logger.error(f"Failed to save metadata to Supabase: {e}")

    def get_video(self, video_id: str) -> Optional[VideoMetadata]:
        if not self._client:
            return None
        try:
            response = self.client.table("video_metadata").select("*").eq("video_id", video_id).execute()
            if response.data:
                return VideoMetadata(**response.data[0])
        except Exception as e:
            logger.error(f"Failed to get metadata from Supabase: {e}")
        return None

    def get_all_videos(self) -> list[VideoMetadata]:
        if not self._client:
            return []
        try:
            response = self._client.table("video_metadata").select("*").execute()
            return [VideoMetadata(**d) for d in response.data]
        except Exception as e:
            logger.error(f"Failed to get all videos from Supabase: {e}")
        return []

    def clear(self):
        if not self._client:
            return
        try:
            # Note: in Supabase deleting without filters might require specific setup or just not equalling null
            self._client.table("video_metadata").delete().neq("video_id", "0").execute()
            logger.info("Cleared all video metadata from Supabase")
        except Exception as e:
            logger.error(f"Failed to clear metadata from Supabase: {e}")

    def has_videos(self) -> bool:
        if not self._client:
            return False
        try:
            response = self._client.table("video_metadata").select("video_id", count="exact").limit(1).execute()
            return response.count > 0
        except Exception as e:
            logger.error(f"Failed to check has_videos in Supabase: {e}")
        return False


# ── Public alias ───────────────────────────────────────────────────────────────

MetadataStore = _SupabaseMetadataStore if SUPABASE_URL else _LocalMetadataStore


@lru_cache(maxsize=1)
def get_metadata_store():
    if SUPABASE_URL:
        return _SupabaseMetadataStore()
    else:
        logger.warning(
            "SUPABASE_URL not set — using local JSON fallback store at %s",
            _FALLBACK_PATH,
        )
        return _LocalMetadataStore()
