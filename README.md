# 🎬 ReelRAG — AI Video Comparison Platform

> Compare YouTube and Instagram videos using **Retrieval Augmented Generation (RAG)**.
> Extract transcripts, index them in a vector database, and chat with your videos.

![Architecture](https://img.shields.io/badge/Architecture-RAG%20Pipeline-teal)
![LangGraph](https://img.shields.io/badge/AI%20Orchestration-LangGraph-blue)
![ChromaDB](https://img.shields.io/badge/Vector%20DB-ChromaDB-orange)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)

---

## ✨ Features

| Feature | Details |
|---|---|
| **Dual Video Input** | YouTube URL + Instagram Reel URL |
| **Transcript Extraction** | `youtube-transcript-api` → `yt-dlp + Whisper` fallback |
| **Engagement Metrics** | Views, likes, comments, follower count, engagement rate |
| **Vector Search** | ChromaDB + BAAI/bge-small-en-v1.5 embeddings |
| **RAG Chat** | LangGraph pipeline with conversation memory |
| **Source Citations** | Every response cites `[Video A | Chunk N]` |
| **Streaming Responses** | SSE token-by-token streaming |
| **Modern UI** | Next.js 15 + Tailwind CSS dark editorial design |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│   Next.js 15 + TypeScript + Tailwind CSS                    │
│   React Query (state) + SSE streaming                       │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP / SSE
┌──────────────────────▼──────────────────────────────────────┐
│                      FASTAPI BACKEND                         │
│                                                             │
│  POST /api/analyze ──→ Background Task                      │
│  GET  /api/videos  ──→ Metadata Store (JSON / PostgreSQL)   │
│  POST /api/chat    ──→ LangGraph RAG Pipeline               │
└──────┬─────────────────────────┬───────────────────────────┘
       │                         │
       ▼                         ▼
┌──────────────┐    ┌────────────────────────────────────────┐
│  Extractors  │    │          LangGraph RAG Pipeline         │
│              │    │                                         │
│ YouTube:     │    │  retrieve_chunks                        │
│  transcript  │    │       ↓                                 │
│  api + yt-   │    │  load_metadata                          │
│  dlp +       │    │       ↓                                 │
│  Whisper     │    │  build_context                          │
│              │    │       ↓                                 │
│ Instagram:   │    │  generate_response (GPT-4o-mini)        │
│  yt-dlp +    │    │       ↓                                 │
│  Whisper     │    │  stream via SSE                         │
└──────┬───────┘    └────────────────┬───────────────────────┘
       │                             │
       ▼                             ▼
┌──────────────┐    ┌───────────────────────────────────────┐
│   Metadata   │    │             ChromaDB                   │
│   Store      │    │  Collection: video_comparison          │
│  (JSON file) │    │  Embeddings: BAAI/bge-small-en-v1.5   │
│              │    │  Chunks: 800 chars / 150 overlap        │
└──────────────┘    └───────────────────────────────────────┘
```

### LangGraph Pipeline Nodes

1. **retrieve_chunks** — Semantic search in ChromaDB for both Video A and B (top-5 each)
2. **load_metadata** — Format video metadata (title, creator, metrics) as context
3. **build_context** — Merge transcript chunks + metadata into prompt context
4. **generate_response** — GPT-4o-mini generates response with source citations
5. **Streaming** — Response streamed word-by-word via SSE

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- `ffmpeg` installed (`brew install ffmpeg` / `apt install ffmpeg`)
- OpenAI API key

### 1. Clone & Setup

```bash
git clone https://github.com/your-org/rag-video-compare
cd rag-video-compare
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**

### 4. Docker (Full Stack)

```bash
docker-compose up --build
```

---

## 📖 API Reference

### `POST /api/analyze`

Start video analysis pipeline (background task).

```json
// Request
{
  "youtube_url": "https://youtube.com/watch?v=xxxxx",
  "instagram_url": "https://instagram.com/reel/yyyyy"
}

// Response
{
  "status": "processing",
  "message": "Analysis started"
}
```

### `GET /api/analyze/status`

Poll analysis progress.

```json
{
  "status": "processing",  // "idle" | "processing" | "completed" | "error"
  "progress": "Indexing YouTube transcript...",
  "error": ""
}
```

### `GET /api/videos`

Return metadata for analyzed videos.

```json
[
  {
    "video_id": "A",
    "title": "...",
    "creator_name": "...",
    "views": 150000,
    "likes": 8200,
    "comments": 340,
    "engagement_rate": 5.69,
    "source": "youtube",
    ...
  }
]
```

### `POST /api/chat`

Chat with videos. Returns SSE stream.

```json
// Request
{
  "message": "Why did Video A perform better than Video B?",
  "session_id": "session_abc123"
}

// SSE Events
data: {"type": "token", "content": "Video A "}
data: {"type": "token", "content": "outperformed "}
...
data: {"type": "sources", "sources": [{"video_id": "A", "chunk_id": 2, "source": "youtube"}]}
data: {"type": "done"}
```

---

## 📐 Chunking & Embeddings

| Parameter | Value |
|---|---|
| Splitter | `RecursiveCharacterTextSplitter` |
| Chunk size | 800 characters |
| Chunk overlap | 150 characters |
| Embedding model | `BAAI/bge-small-en-v1.5` (384-dim) |
| Vector DB | ChromaDB (persistent) |
| Collection | `video_comparison` |
| Top-K retrieval | 5 per video |

### Chunk Schema

```json
{
  "video_id": "A",
  "chunk_id": 1,
  "content": "In this video I'm going to show you...",
  "source": "youtube"
}
```

---

## 💰 Cost & Scalability Analysis

### Current Architecture

| Component | Choice | Rationale |
|---|---|---|
| LLM | GPT-4o-mini | Best cost/quality ratio |
| Embeddings | BAAI/bge-small-en-v1.5 (local) | $0 embedding cost |
| Vector DB | ChromaDB (local) | Zero-cost, single-node |
| Metadata | JSON file | Simple, no infra needed |
| Queue | None (background tasks) | Sufficient for low volume |

### Cost Estimates

#### 100 creators/day (~200 videos/day)

Assuming avg. 5-min video → ~750 tokens transcript → ~10 chunks

| Item | Cost/day |
|---|---|
| Embeddings (local BAAI) | $0 |
| GPT-4o-mini (50 chats × 3K tokens) | ~$0.05 |
| Infrastructure (single server) | ~$1.00 |
| **Total** | **~$1.05/day** |

#### 1,000 creators/day (~2,000 videos)

At this scale, switch to managed infrastructure:

| Item | Cost/day |
|---|---|
| Embeddings (local, 2 workers) | $0 |
| GPT-4o-mini (500 chats) | ~$0.50 |
| Whisper compute (EC2 GPU spot) | ~$5.00 |
| **Total** | **~$5.50/day** |

#### 10,000 creators/day (~20,000 videos)

Full production architecture required:

| Item | Cost/day |
|---|---|
| Embeddings (local cluster) | $0 |
| GPT-4o-mini (5,000 chats) | ~$5.00 |
| Whisper workers (4× GPU) | ~$40.00 |
| pgvector (RDS PostgreSQL) | ~$10.00 |
| Redis cache | ~$3.00 |
| **Total** | **~$58/day** |

### Scaling Recommendations

#### ChromaDB → pgvector

At >10K videos, migrate to **pgvector on PostgreSQL**:
- Managed service (AWS RDS, Supabase) with point-in-time recovery
- Supports billions of vectors with HNSW indexing
- Better concurrent write performance
- Full SQL for hybrid search (metadata + vector)

```sql
-- pgvector example
CREATE TABLE chunks (
  id SERIAL PRIMARY KEY,
  video_id TEXT,
  chunk_id INT,
  content TEXT,
  source TEXT,
  embedding vector(384)
);
CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);
```

#### Queue Workers

Replace FastAPI background tasks with **Celery + Redis** or **AWS SQS**:
- Retry logic for failed Whisper transcriptions
- Priority queues (Instagram harder to scrape → lower priority)
- Horizontal scaling: 10+ Whisper workers processing in parallel
- Dead-letter queues for failed jobs

#### Redis Caching

Cache at two levels:
1. **Metadata cache** — `GET /videos` responses cached 5 minutes
2. **RAG context cache** — cache `(query, video_ids)` → response for 1 hour
   - Hash the query + video IDs as cache key
   - Reduces LLM costs 40-60% for common questions

#### Embedding Cost

`BAAI/bge-small-en-v1.5` runs fully locally (384-dim, 33M params).
At 10K videos/day it uses ~2 CPU-minutes/video = ~$0 if co-hosted.
Alternative: OpenAI `text-embedding-3-small` at $0.02/1M tokens ≈ $0.002/video.

---

## 🧪 Example Questions

```
"Why did Video A perform better than Video B?"
"Compare the hooks in the first 5 seconds of each video"
"What is the engagement rate difference between the two videos?"
"Compare the storytelling techniques used"
"Suggest 3 improvements for Video B's CTA"
"Who created Video B and how many followers do they have?"
"Which video had more hashtags and what were they?"
```

---

## 🗂️ Project Structure

```
rag-video-compare/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic models
│   │   ├── routers/
│   │   │   ├── analyze.py       # POST /analyze
│   │   │   ├── videos.py        # GET /videos
│   │   │   └── chat.py          # POST /chat (SSE)
│   │   ├── services/
│   │   │   ├── youtube_service.py    # YouTube extraction
│   │   │   ├── instagram_service.py  # Instagram extraction
│   │   │   ├── vector_store.py       # ChromaDB service
│   │   │   └── metadata_store.py     # JSON metadata store
│   │   ├── graphs/
│   │   │   └── rag_graph.py     # LangGraph RAG pipeline
│   │   └── utils/
│   │       └── logging.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Dashboard page
│   │   ├── layout.tsx           # Root layout
│   │   ├── globals.css          # Design system CSS
│   │   ├── providers.tsx        # React Query provider
│   │   ├── components/
│   │   │   ├── AnalyzeForm.tsx  # URL input + submit
│   │   │   ├── VideoCard.tsx    # Video metadata card
│   │   │   └── ChatWindow.tsx   # Streaming chat UI
│   │   ├── hooks/
│   │   │   ├── useAnalyze.ts    # Analysis + polling
│   │   │   └── useChat.ts       # SSE chat hook
│   │   └── services/
│   │       └── api.ts           # API client
│   ├── package.json
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔀 Git Commit Plan

```
feat: initial project scaffold with Next.js 15 and FastAPI
feat: YouTube transcript extraction with yt-dlp + Whisper fallback
feat: Instagram reel extraction service using yt-dlp + Whisper
feat: ChromaDB vector store with BAAI embeddings and chunking
feat: LangGraph RAG pipeline with conversation memory
feat: SSE streaming chat endpoint with source citations
feat: React frontend with video cards and engagement metrics
feat: streaming chat UI with ReactMarkdown and source badges
feat: Docker Compose setup for full-stack deployment
docs: README with architecture, API docs, and scalability analysis
```

---

## ⚠️ Known Limitations

- **Instagram scraping**: Instagram aggressively rate-limits yt-dlp. Private reels will fail.
- **Single-node ChromaDB**: Not suitable for distributed deployments without migration to pgvector.
- **Whisper**: GPU recommended for production; CPU transcription of a 10-min video takes ~2-5 minutes.
- **Conversation memory**: LangGraph MemorySaver stores state in-process; restarts clear history.

---

## 📄 License

MIT © 2024 ReelRAG Team
