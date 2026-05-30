# 🎬 ReelRag

ReelRag is an AI-powered video comparison platform that leverages **Retrieval-Augmented Generation (RAG)** to analyze, compare, and chat with content from YouTube and Instagram. By extracting video metadata and audio transcripts, vectorizing them, and feeding them through a state-of-the-art LLM pipeline via LangGraph, ReelRag provides creators and marketers deep insights into engagement and content strategy.

![Architecture](https://img.shields.io/badge/Architecture-RAG%20Pipeline-teal)
![LangGraph](https://img.shields.io/badge/AI%20Orchestration-LangGraph-blue)
![ChromaDB](https://img.shields.io/badge/Vector%20DB-ChromaDB-orange)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)

---

## ✨ Key Features

- **Cross-Platform Metadata Extraction:** Aggregates real-time metrics (Views, Likes, Comments, Followers) from YouTube and Instagram Reels.
- **Robust Instagram Fallback:** Integrates with RapidAPI (`instagram-scraper-stable-api`) to securely bypass Instagram's restrictive scraping policies and retrieve accurate metrics.
- **Automated Transcription:** Leverages `yt-dlp` alongside OpenAI's local `Whisper` models to pull raw audio and transcribe content automatically.
- **Semantic Vector Search:** Employs `BAAI/bge-small-en-v1.5` embeddings stored in a persistent `ChromaDB` vector store to enable highly relevant contextual chunk retrieval.
- **Agentic RAG Pipeline:** Driven by `LangGraph` and blazing fast LLM inference (via Groq/OpenAI APIs), ensuring contextual memory and grounded citations across chat interactions.
- **Real-Time Streaming Interface:** Features a sleek, dark-themed UI built on `Next.js 15` and `Tailwind CSS`, offering token-by-token Server-Sent Events (SSE) streaming for AI responses.

---

## 🏗️ System Architecture

The application is structured into a cleanly decoupled frontend and backend:

### Backend (FastAPI + LangGraph)
1. **Extraction Layer:** Uses `yt-dlp` and `RapidAPI` to resolve URLs into normalized metadata schemas.
2. **Audio Processing:** Downloads temporary `.mp3` payloads and processes them through local `Whisper` models for transcription.
3. **Indexing:** Splits transcript text using `RecursiveCharacterTextSplitter` (800 chars / 150 overlap) and indexes them into `ChromaDB`.
4. **RAG Orchestration:** A `LangGraph` state machine manages memory, searches the vector database, constructs prompts, and yields tokens back to the client via SSE.

### Frontend (Next.js 15)
1. **State Management:** Custom React hooks (`useAnalyze`, `useChat`) to manage polling and UI states.
2. **Streaming Parser:** Real-time parser that catches `[Video A | Chunk N]` citations and maps them directly to interactive UI badges.
3. **Responsive Design:** Modular component architecture (e.g., `EngagementComparison`, `VideoCard`) built entirely with Tailwind CSS utility classes.

---

## 🚀 Developer Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- `ffmpeg` (Required for audio extraction: `brew install ffmpeg` / `apt install ffmpeg`)
- API Keys: [Groq](https://console.groq.com/keys) & [RapidAPI](https://rapidapi.com/)

### 1. Environment Configuration

Clone the repository and set up your environment variables:

```bash
git clone https://github.com/MRaashu76/ReelRag.git
cd ReelRag
cp .env.example .env
```

Ensure the following variables are populated in your `.env` file:
```env
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=instagram-scraper-stable-api.p.rapidapi.com
GROQ_API_KEY=your_groq_api_key_here
```

### 2. Backend Initialization

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Initialization

In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:3000` to interact with the platform.

---

## 📖 API Reference

- `POST /api/analyze` - Start a background analysis pipeline for two URLs.
- `GET /api/analyze/status` - Poll the status of the ongoing analysis.
- `GET /api/videos` - Retrieve cached metadata and engagement stats.
- `POST /api/chat` - Initialize a conversational interaction with the LLM (yields SSE stream).

---

## 🛠️ Tech Stack & Decisions

- **FastAPI:** Chosen for its native asynchronous capabilities and ease of streaming Server-Sent Events.
- **LangGraph:** Enables complex, cyclical logic (like handling memory and multi-step retrieval) which standard LangChain pipelines struggle with.
- **ChromaDB:** A lightweight, persistent vector store perfect for scaling on local hardware before migrating to `pgvector`.
- **RapidAPI (Instagram Scraper Stable API):** A necessary proxy/abstraction to circumvent rate limits and login walls native to the Instagram Graph API.

---

## 📄 License

MIT © 2024 MRaashu76
