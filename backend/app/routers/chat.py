"""
/chat endpoint with SSE streaming
"""
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.models.schemas import ChatRequest
from app.graphs.rag_graph import stream_chat_response
from app.services.metadata_store import get_metadata_store

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/chat")
async def chat(request: ChatRequest):
    """
    Chat with the analyzed videos using RAG.
    Returns a streaming SSE response.
    """
    store = get_metadata_store()
    if not store.has_videos():
        raise HTTPException(
            status_code=400,
            detail="No videos analyzed yet. Please analyze videos first.",
        )

    async def generate():
        async for chunk in stream_chat_response(
            message=request.message,
            session_id=request.session_id or "default",
        ):
            yield chunk

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
