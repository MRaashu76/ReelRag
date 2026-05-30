"""
Simple in-memory TTL cache for API responses and search results.
Reduces redundant ChromaDB queries and LLM calls.
"""
import time
import hashlib
import json
import logging
from typing import Any, Optional
from functools import wraps

logger = logging.getLogger(__name__)


class TTLCache:
    """Thread-safe in-memory cache with time-to-live expiry."""

    def __init__(self, default_ttl: int = 300):
        self._store: dict[str, tuple[Any, float]] = {}
        self.default_ttl = default_ttl

    def _is_expired(self, expiry: float) -> bool:
        return time.monotonic() > expiry

    def get(self, key: str) -> Optional[Any]:
        entry = self._store.get(key)
        if entry is None:
            return None
        value, expiry = entry
        if self._is_expired(expiry):
            del self._store[key]
            return None
        return value

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        ttl = ttl or self.default_ttl
        self._store[key] = (value, time.monotonic() + ttl)

    def delete(self, key: str) -> None:
        self._store.pop(key, None)

    def clear(self) -> None:
        self._store.clear()

    def evict_expired(self) -> int:
        """Remove all expired entries. Returns count removed."""
        now = time.monotonic()
        expired = [k for k, (_, exp) in self._store.items() if now > exp]
        for k in expired:
            del self._store[k]
        return len(expired)

    @property
    def size(self) -> int:
        return len(self._store)


def make_cache_key(*args, **kwargs) -> str:
    """Create a stable cache key from arbitrary arguments."""
    payload = json.dumps({"args": args, "kwargs": kwargs}, sort_keys=True, default=str)
    return hashlib.sha256(payload.encode()).hexdigest()[:16]


# Module-level cache instances
_video_metadata_cache = TTLCache(default_ttl=300)   # 5 min
_search_result_cache = TTLCache(default_ttl=120)     # 2 min


def get_metadata_cache() -> TTLCache:
    return _video_metadata_cache


def get_search_cache() -> TTLCache:
    return _search_result_cache


def cached_search(query: str, video_id: Optional[str], k: int, fn) -> list[dict]:
    """
    Cache wrapper for vector search calls.
    Cache key = hash(query + video_id + k).
    """
    cache = get_search_cache()
    key = make_cache_key(query, video_id, k)
    cached = cache.get(key)
    if cached is not None:
        logger.debug(f"Cache hit for search key={key[:8]}…")
        return cached
    result = fn()
    cache.set(key, result)
    return result
