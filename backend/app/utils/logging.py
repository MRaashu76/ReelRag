"""Logging configuration."""
import logging
import sys


def setup_logging(level: str = "INFO"):
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )
    # Suppress noisy libraries
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("chromadb").setLevel(logging.WARNING)
