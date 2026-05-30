// API service for RAG Video Comparison backend

const BASE_URL = "/api";

export interface VideoMetadata {
  video_id: string;
  title: string;
  creator_name: string;
  follower_count: number | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  upload_date: string | null;
  duration_seconds: number | null;
  hashtags: string[];
  transcript: string | null;
  engagement_rate: number | null;
  source: "youtube" | "instagram";
  url: string;
}

export interface AnalyzeRequest {
  video_a_url: string;
  video_b_url: string;
}

export interface AnalysisStatus {
  status: "idle" | "processing" | "completed" | "error";
  progress: string;
  error: string;
}

export interface ChatSource {
  video_id: string;
  chunk_id: number;
  source: string;
}

export interface ChatStreamEvent {
  type: "token" | "sources" | "done" | "error";
  content?: string;
  sources?: ChatSource[];
}

// ── Analyze ───────────────────────────────────────────────────────────────────

export async function analyzeVideos(req: AnalyzeRequest): Promise<void> {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
}

export async function getAnalysisStatus(): Promise<AnalysisStatus> {
  const res = await fetch(`${BASE_URL}/analyze/status`);
  if (!res.ok) throw new Error("Failed to fetch status");
  return res.json();
}

// ── Videos ────────────────────────────────────────────────────────────────────

export async function getVideos(): Promise<VideoMetadata[]> {
  const res = await fetch(`${BASE_URL}/videos`);
  if (!res.ok) throw new Error("Failed to fetch videos");
  return res.json();
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export async function* streamChat(
  message: string,
  sessionId: string = "default"
): AsyncGenerator<ChatStreamEvent> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Chat failed" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const json = line.slice(6).trim();
          if (json) {
            try {
              yield JSON.parse(json) as ChatStreamEvent;
            } catch {
              // Skip malformed events
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
