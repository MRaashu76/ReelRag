"""
Debug utilities for the LangGraph RAG pipeline.
Run directly: python -m app.graphs.debug_graph
"""
import asyncio
import os
import sys

# Add parent to path so we can run as module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))


def print_graph_structure():
    """Print the LangGraph node/edge structure."""
    from app.graphs.rag_graph import build_rag_graph

    graph = build_rag_graph()
    print("\n=== LangGraph RAG Pipeline Structure ===\n")

    # Print graph as Mermaid diagram
    try:
        mermaid = graph.get_graph().draw_mermaid()
        print("Mermaid diagram:")
        print(mermaid)
    except Exception as e:
        print(f"Could not draw Mermaid: {e}")

    print("\nNodes:", list(graph.get_graph().nodes.keys()))
    print("Edges:", [(e.source, e.target) for e in graph.get_graph().edges])


async def run_test_query(query: str = "Compare the engagement rates of both videos"):
    """Run a test RAG query and print the result."""
    from app.graphs.rag_graph import stream_chat_response
    import json

    print(f"\n=== Test Query: {query!r} ===\n")
    print("Response:\n")

    full_response = ""
    sources = []

    async for raw in stream_chat_response(query, session_id="debug_session"):
        # raw is an SSE string: "data: {...}\n\n"
        if raw.startswith("data: "):
            try:
                event = json.loads(raw[6:].strip())
                if event["type"] == "token":
                    chunk = event.get("content", "")
                    print(chunk, end="", flush=True)
                    full_response += chunk
                elif event["type"] == "sources":
                    sources = event.get("sources", [])
                elif event["type"] == "error":
                    print(f"\n[ERROR] {event.get('content')}")
            except json.JSONDecodeError:
                pass

    print("\n\nSources cited:")
    for s in sources:
        print(f"  [Video {s['video_id']} | Chunk {s['chunk_id']}] ({s['source']})")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Debug the LangGraph RAG pipeline")
    parser.add_argument("--structure", action="store_true", help="Print graph structure")
    parser.add_argument("--query", type=str, help="Run a test query")
    args = parser.parse_args()

    if args.structure:
        print_graph_structure()

    if args.query:
        asyncio.run(run_test_query(args.query))

    if not args.structure and not args.query:
        print_graph_structure()
        print("\nTip: Use --query 'your question here' to test RAG")
