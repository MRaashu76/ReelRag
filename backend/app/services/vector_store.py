"""
ChromaDB vector store service with BAAI/bge-small-en-v1.5 embeddings.
Includes TTL cache for search results to reduce redundant queries.
"""
import logging
from typing import Optional
from functools import lru_cache

import chromadb
from chromadb.config import Settings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_chroma import Chroma

from app.utils.cache import cached_search, get_search_cache

logger = logging.getLogger(__name__)

COLLECTION_NAME = "video_comparison"
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
        self.client = chromadb.PersistentClient(
            path="./chroma_db",
            settings=Settings(anonymized_telemetry=False),
        )
        self._vectorstore: Optional[Chroma] = None

    def ensure_collection(self):
        self._vectorstore = Chroma(
            client=self.client,
            collection_name=COLLECTION_NAME,
            embedding_function=self.embedding_model,
        )
        logger.info(f"ChromaDB collection '{COLLECTION_NAME}' ready.")

    @property
    def vectorstore(self) -> Chroma:
        if self._vectorstore is None:
            self.ensure_collection()
        return self._vectorstore

    def clear_video(self, video_id: str):
        try:
            collection = self.client.get_collection(COLLECTION_NAME)
            results = collection.get(where={"video_id": video_id})
            if results["ids"]:
                collection.delete(ids=results["ids"])
                logger.info(f"Cleared {len(results['ids'])} chunks for video_id={video_id}")
            get_search_cache().clear()
        except Exception as e:
            logger.warning(f"Could not clear video {video_id}: {e}")

    def ingest_transcript(self, transcript: str, video_id: str, source: str) -> int:
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
        chunks = splitter.split_text(transcript)
        logger.info(f"Split transcript into {len(chunks)} chunks for video_id={video_id}")
        self.clear_video(video_id)

        documents, metadatas, ids = [], [], []
        for i, chunk in enumerate(chunks):
            documents.append(chunk)
            metadatas.append({"video_id": video_id, "chunk_id": i + 1, "source": source})
            ids.append(f"{video_id}_chunk_{i + 1}")

        self.vectorstore.add_texts(texts=documents, metadatas=metadatas, ids=ids)
        logger.info(f"Stored {len(chunks)} chunks for video_id={video_id} in ChromaDB")
        return len(chunks)

    def search(self, query: str, video_id: Optional[str] = None, k: int = TOP_K) -> list[dict]:
        def _do_search():
            filter_dict = {"video_id": video_id} if video_id else None
            try:
                results = self.vectorstore.similarity_search_with_score(
                    query=query, k=k, filter=filter_dict,
                )
                return [
                    {"content": doc.page_content, "metadata": doc.metadata, "score": float(score)}
                    for doc, score in results
                ]
            except Exception as e:
                logger.error(f"Vector search failed: {e}")
                return []
        return cached_search(query=query, video_id=video_id, k=k, fn=_do_search)

    def search_both_videos(self, query: str, k_per_video: int = TOP_K) -> list[dict]:
        return self.search(query, video_id="A", k=k_per_video) + \
               self.search(query, video_id="B", k=k_per_video)

    def collection_stats(self) -> dict:
        try:
            collection = self.client.get_collection(COLLECTION_NAME)
            all_docs = collection.get()
            total = len(all_docs["ids"])
            by_video: dict[str, int] = {}
            for meta in all_docs.get("metadatas", []):
                if meta:
                    vid = meta.get("video_id", "unknown")
                    by_video[vid] = by_video.get(vid, 0) + 1
            return {"total_chunks": total, "by_video": by_video}
        except Exception as e:
            return {"error": str(e)}


@lru_cache(maxsize=1)
def get_vector_store() -> VectorStore:
    return VectorStore()
