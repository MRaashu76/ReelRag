import os
import logging
from supabase import create_client, Client

logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

_supabase_client = None

def get_supabase_client() -> Client:
    global _supabase_client
    if _supabase_client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            logger.warning("SUPABASE_URL or SUPABASE_KEY not set. Features relying on database will fail.")
        else:
            try:
                _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
                logger.info("Connected to Supabase successfully")
            except Exception as e:
                logger.error(f"Failed to connect to Supabase: {e}")
    return _supabase_client
