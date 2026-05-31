"""
Supabase PostgreSQL pgvector store service with BAAI/bge-small-en-v1.5 embeddings.
Includes TTL cache for search results to reduce redundant queries.
"""
import logging
from typing import Optional
from functools import lru_cache

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings

from app.utils.cache import cached_search, get_search_cache
from app.services.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

CHUNK_SIZE = 800
CHUNK_OVERLAP = 150
TOP_K = 5


class VectorStore:
    def __init__(self):
        self.embedding_model = HuggingFaceEmbeddings(
            model_name="BAAI/bge-small-en-v1.5",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
        self.client = get_supabase_client()

    def clear_video(self, video_id: str):
        if not self.client:
            return
        try:
            response = self.client.table("video_chunks").delete().eq("video_id", video_id).execute()
            logger.info(f"Cleared existing chunks for video_id={video_id}")
            get_search_cache().clear()
        except Exception as e:
            logger.warning(f"Could not clear video {video_id}: {e}")

    def ingest_transcript(self, transcript: str, video_id: str, source: str) -> int:
        if not self.client:
            logger.error("Supabase client not initialized. Cannot ingest transcript.")
            return 0

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
        chunks = splitter.split_text(transcript)
        logger.info(f"Split transcript into {len(chunks)} chunks for video_id={video_id}")
        
        self.clear_video(video_id)

        records = []
        for i, chunk in enumerate(chunks):
            embedding = self.embedding_model.embed_query(chunk)
            records.append({
                "video_id": video_id,
                "chunk_id": i + 1,
                "content": chunk,
                "source": source,
                "embedding": embedding
            })

        if records:
            try:
                self.client.table("video_chunks").insert(records).execute()
                logger.info(f"Stored {len(chunks)} chunks for video_id={video_id} in Supabase")
            except Exception as e:
                logger.error(f"Failed to insert chunks into Supabase: {e}")

        return len(chunks)

    def search(self, query: str, video_id: Optional[str] = None, k: int = TOP_K) -> list[dict]:
        def _do_search():
            if not self.client:
                return []
                
            try:
                query_embedding = self.embedding_model.embed_query(query)
                
                # We call a custom Postgres function 'match_video_chunks'
                # which takes the embedding and optional video_id
                rpc_args = {
                    "query_embedding": query_embedding,
                    "match_threshold": 0.0,  # Or a suitable threshold
                    "match_count": k
                }
                if video_id:
                    rpc_args["filter_video_id"] = video_id
                else:
                    rpc_args["filter_video_id"] = None
                    
                response = self.client.rpc("match_video_chunks", rpc_args).execute()
                
                results = []
                for row in response.data:
                    results.append({
                        "content": row["content"],
                        "metadata": {
                            "video_id": row["video_id"],
                            "chunk_id": row["chunk_id"],
                            "source": row["source"]
                        },
                        "score": 1.0 - float(row["similarity"])  # pgvector returns cosine distance/similarity
                    })
                return results
            except Exception as e:
                logger.error(f"Vector search failed: {e}")
                return []
                
        return cached_search(query=query, video_id=video_id, k=k, fn=_do_search)

    def search_both_videos(self, query: str, k_per_video: int = TOP_K) -> list[dict]:
        return self.search(query, video_id="A", k=k_per_video) + \
               self.search(query, video_id="B", k=k_per_video)

    def collection_stats(self) -> dict:
        if not self.client:
            return {"error": "Supabase client not initialized"}
        try:
            # simple count query
            response = self.client.table("video_chunks").select("video_id", count="exact").execute()
            total = response.count
            
            # Since we can't easily group by in standard Supabase API without an RPC,
            # we'll just fetch unique video_ids or return a simplified stat for now.
            return {"total_chunks": total, "status": "using_supabase_pgvector"}
        except Exception as e:
            return {"error": str(e)}


@lru_cache(maxsize=1)
def get_vector_store() -> VectorStore:
    return VectorStore()
