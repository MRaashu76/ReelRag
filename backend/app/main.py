"""
RAG Video Comparison Platform - FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routers import analyze, videos, chat, admin
from app.services.vector_store import get_vector_store
from app.utils.logging import setup_logging

import os
from dotenv import load_dotenv
# Load .env from project root
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))

setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize ChromaDB collection
    vs = get_vector_store()
    vs.ensure_collection()
    yield
    # Shutdown: cleanup if needed


app = FastAPI(
    title="RAG Video Comparison Platform",
    description="Compare YouTube and Instagram videos using RAG",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api", tags=["analyze"])
app.include_router(videos.router, prefix="/api", tags=["videos"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(admin.router, prefix="/api", tags=["admin"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "rag-video-compare"}
