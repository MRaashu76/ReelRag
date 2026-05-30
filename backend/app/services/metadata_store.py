"""
Metadata store for video metadata.

- If MONGODB_URI is set  → uses MongoDB Atlas (production).
- If MONGODB_URI is unset → falls back to a local JSON file (development).
"""
import json
import logging
import os
from pathlib import Path
from typing import Optional
from functools import lru_cache

from app.models.schemas import VideoMetadata

logger = logging.getLogger(__name__)

MONGO_URI = os.getenv("MONGODB_URI", "")
DB_NAME = os.getenv("MONGODB_DB", "reelrag")
COLLECTION_NAME = "videos"

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


# ── MongoDB store ──────────────────────────────────────────────────────────────

class _MongoMetadataStore:
    """MongoDB Atlas-backed metadata store."""

    def __init__(self):
        from pymongo import MongoClient
        from pymongo.collection import Collection

        self._client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        self._col: Collection = self._client[DB_NAME][COLLECTION_NAME]
        logger.info("Connected to MongoDB Atlas successfully")

    def save_video(self, metadata: VideoMetadata):
        doc = metadata.model_dump()
        doc["_id"] = metadata.video_id
        self._col.replace_one({"_id": doc["_id"]}, doc, upsert=True)
        logger.info(f"Saved metadata for video_id={metadata.video_id}")

    def get_video(self, video_id: str) -> Optional[VideoMetadata]:
        doc = self._col.find_one({"_id": video_id})
        if doc:
            doc.pop("_id", None)
            return VideoMetadata(**doc)
        return None

    def get_all_videos(self) -> list[VideoMetadata]:
        docs = list(self._col.find())
        for doc in docs:
            doc.pop("_id", None)
        return [VideoMetadata(**d) for d in docs]

    def clear(self):
        self._col.delete_many({})
        logger.info("Cleared all video metadata from MongoDB")

    def has_videos(self) -> bool:
        return self._col.count_documents({}) > 0


# ── Public alias ───────────────────────────────────────────────────────────────

MetadataStore = _MongoMetadataStore if MONGO_URI else _LocalMetadataStore


@lru_cache(maxsize=1)
def get_metadata_store():
    if MONGO_URI:
        logger.info("MONGODB_URI found — using MongoDB Atlas store")
        return _MongoMetadataStore()
    else:
        logger.warning(
            "MONGODB_URI not set — using local JSON fallback store at %s",
            _FALLBACK_PATH,
        )
        return _LocalMetadataStore()
