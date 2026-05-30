"""
Admin endpoints for debugging and monitoring.
GET /api/admin/stats   — ChromaDB collection stats + cache info
DELETE /api/admin/cache — Clear search result cache
"""
from fastapi import APIRouter
from app.services.vector_store import get_vector_store
from app.services.metadata_store import get_metadata_store
from app.utils.cache import get_search_cache, get_metadata_cache

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
async def get_stats():
    """Return ChromaDB collection stats, metadata store info, and cache sizes."""
    vs = get_vector_store()
    store = get_metadata_store()
    search_cache = get_search_cache()
    meta_cache = get_metadata_cache()

    return {
        "chromadb": vs.collection_stats(),
        "metadata_store": {
            "video_count": len(store.get_all_videos()),
            "video_ids": [v.video_id for v in store.get_all_videos()],
        },
        "cache": {
            "search_cache_entries": search_cache.size,
            "metadata_cache_entries": meta_cache.size,
        },
    }


@router.delete("/cache")
async def clear_cache():
    """Flush all in-memory caches."""
    get_search_cache().clear()
    get_metadata_cache().clear()
    return {"status": "cleared", "message": "All caches flushed"}


@router.delete("/videos")
async def reset_videos():
    """Clear all video metadata and ChromaDB data (for fresh analysis)."""
    store = get_metadata_store()
    vs = get_vector_store()
    store.clear()
    for vid_id in ["A", "B"]:
        vs.clear_video(vid_id)
    return {"status": "reset", "message": "All video data cleared"}
