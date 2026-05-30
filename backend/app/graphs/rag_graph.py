"""
LangGraph RAG pipeline for video comparison chatbot.
Nodes: memory → retrieve → load_metadata → build_context → generate → stream
"""
import logging
import os
from typing import Any, AsyncIterator, TypedDict, Annotated
from operator import add

from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from app.services.vector_store import get_vector_store
from app.services.metadata_store import get_metadata_store

logger = logging.getLogger(__name__)


# ── State ──────────────────────────────────────────────────────────────────────

class RAGState(TypedDict):
    messages: Annotated[list[BaseMessage], add]
    query: str
    retrieved_chunks: list[dict]
    metadata_context: str
    final_context: str
    response: str
    sources: list[dict]


# ── Node functions ─────────────────────────────────────────────────────────────

def node_retrieve_chunks(state: RAGState) -> dict:
    """Retrieve relevant chunks from ChromaDB for both videos."""
    vs = get_vector_store()
    query = state["query"]
    chunks = vs.search_both_videos(query, k_per_video=5)
    logger.info(f"Retrieved {len(chunks)} chunks for query: {query[:60]}...")
    return {"retrieved_chunks": chunks}


def node_load_metadata(state: RAGState) -> dict:
    """Load video metadata and format as context string."""
    store = get_metadata_store()
    videos = store.get_all_videos()

    meta_parts = []
    for video in videos:
        part = f"""
=== Video {video.video_id} ({'YouTube' if video.source == 'youtube' else 'Instagram'}) ===
Title: {video.title}
Creator: {video.creator_name}
Follower Count: {f'{video.follower_count:,} followers' if video.follower_count is not None else 'N/A'}
Views: {f'{video.views:,}' if video.views is not None else 'N/A'}
Likes: {f'{video.likes:,}' if video.likes is not None else 'N/A'}
Comments: {f'{video.comments:,}' if video.comments is not None else 'N/A'}
Engagement Rate: {f'{video.engagement_rate:.2f}%' if video.engagement_rate is not None else 'N/A'}
Upload Date: {video.upload_date or 'N/A'}
Duration: {f'{video.duration_seconds}s' if video.duration_seconds is not None else 'N/A'}
Hashtags: {', '.join(video.hashtags) if video.hashtags else 'None'}
""".strip()
        meta_parts.append(part)

    metadata_context = "\n\n".join(meta_parts) if meta_parts else "No video metadata available."
    return {"metadata_context": metadata_context}


def node_build_context(state: RAGState) -> dict:
    """Combine metadata + transcript chunks into final context."""
    chunks = state["retrieved_chunks"]
    metadata_context = state["metadata_context"]

    # Format chunks grouped by video
    chunks_by_video: dict[str, list[dict]] = {}
    sources = []
    for chunk in chunks:
        vid = chunk["metadata"]["video_id"]
        chunks_by_video.setdefault(vid, []).append(chunk)
        sources.append({
            "video_id": vid,
            "chunk_id": chunk["metadata"]["chunk_id"],
            "source": chunk["metadata"]["source"],
        })

    transcript_parts = []
    for vid in sorted(chunks_by_video.keys()):
        vid_chunks = chunks_by_video[vid]
        transcript_parts.append(f"\n--- Video {vid} Transcript Excerpts ---")
        for c in vid_chunks:
            transcript_parts.append(
                f"[Video {c['metadata']['video_id']} | Chunk {c['metadata']['chunk_id']}]\n{c['content']}"
            )

    transcript_context = "\n".join(transcript_parts)
    final_context = f"{metadata_context}\n\n{transcript_context}"
    return {"final_context": final_context, "sources": sources}


def node_generate_response(state: RAGState) -> dict:
    """Generate LLM response using context and conversation history."""
    from g4f.client import Client

    # Build conversation history (last 10 turns)
    history = state["messages"][-10:]
    history_text = ""
    if history:
        history_parts = []
        for msg in history[:-1]:  # Exclude current query
            role = "User" if isinstance(msg, HumanMessage) else "Assistant"
            history_parts.append(f"{role}: {msg.content}")
        history_text = "\n".join(history_parts)

    system_prompt = f"""You are an expert social media analyst comparing two videos using their transcripts and metadata.

IMPORTANT RULES:
- Base ALL answers on the provided context (metadata + transcript chunks)
- Cite sources as [Video A | Chunk N] or [Video B | Chunk N]
- Never invent information not present in the context
- Be specific and analytical; reference actual content from transcripts
- End every response with a Sources section listing all chunks cited
- Maintain awareness of conversation history for follow-up questions

=== VIDEO METADATA & CONTEXT ===
{state['final_context']}

=== CONVERSATION HISTORY ===
{history_text if history_text else 'This is the start of the conversation.'}
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": state["query"]},
    ]

    groq_api_key = os.environ.get("GROQ_API_KEY", "")
    
    if groq_api_key and "..." not in groq_api_key:
        try:
            llm = ChatGroq(model="llama-3.1-8b-instant", groq_api_key=groq_api_key)
            # Convert messages to format expected by ChatGroq
            lc_messages = []
            for msg in messages:
                if msg["role"] == "system":
                    lc_messages.append(("system", msg["content"]))
                else:
                    lc_messages.append(("user", msg["content"]))
            response = llm.invoke(lc_messages)
            response_text = response.content
            return {"response": response_text}
        except Exception as e:
            logger.error(f"Groq chat failed: {e}")
            pass # Fallback to g4f
            
    try:
        import g4f
        client = Client()
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
        )
        response_text = response.choices[0].message.content
    except Exception as e:
        logger.error(f"g4f chat failed: {e}")
        response_text = "I encountered an error while contacting the free chat service. Please try again or add a GROQ_API_KEY to your .env file."

    return {"response": response_text}


# ── Graph Builder ──────────────────────────────────────────────────────────────

def build_rag_graph():
    """Build and compile the LangGraph RAG pipeline."""
    builder = StateGraph(RAGState)

    builder.add_node("retrieve_chunks", node_retrieve_chunks)
    builder.add_node("load_metadata", node_load_metadata)
    builder.add_node("build_context", node_build_context)
    builder.add_node("generate_response", node_generate_response)

    builder.set_entry_point("retrieve_chunks")
    builder.add_edge("retrieve_chunks", "load_metadata")
    builder.add_edge("load_metadata", "build_context")
    builder.add_edge("build_context", "generate_response")
    builder.add_edge("generate_response", END)

    memory = MemorySaver()
    return builder.compile(checkpointer=memory)


# Singleton graph instance
_graph = None


def get_rag_graph():
    global _graph
    if _graph is None:
        _graph = build_rag_graph()
        logger.info("LangGraph RAG pipeline compiled.")
    return _graph


# ── Streaming ─────────────────────────────────────────────────────────────────

async def stream_chat_response(
    message: str,
    session_id: str = "default",
) -> AsyncIterator[str]:
    """
    Run RAG pipeline and stream the response token by token using OpenAI streaming.
    Yields SSE-formatted strings.
    """
    import json

    graph = get_rag_graph()
    config = {"configurable": {"thread_id": session_id}}

    # Get conversation history from graph state
    try:
        state_snapshot = graph.get_state(config)
        messages = state_snapshot.values.get("messages", []) if state_snapshot.values else []
    except Exception:
        messages = []

    # Add current message to history
    messages = list(messages) + [HumanMessage(content=message)]

    initial_state = RAGState(
        messages=messages,
        query=message,
        retrieved_chunks=[],
        metadata_context="",
        final_context="",
        response="",
        sources=[],
    )

    # Run non-streaming parts of the graph
    try:
        result = await graph.ainvoke(initial_state, config=config)
        response_text = result["response"]
        sources = result.get("sources", [])

        # Stream the response word by word for SSE effect
        words = response_text.split(" ")
        for i, word in enumerate(words):
            chunk = word + (" " if i < len(words) - 1 else "")
            yield f"data: {json.dumps({'type': 'token', 'content': chunk})}\n\n"

        # Send sources
        unique_sources = []
        seen = set()
        for s in sources:
            key = f"{s['video_id']}_{s['chunk_id']}"
            if key not in seen:
                seen.add(key)
                unique_sources.append(s)

        yield f"data: {json.dumps({'type': 'sources', 'sources': unique_sources})}\n\n"
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    except Exception as e:
        logger.error(f"RAG pipeline error: {e}")
        yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
