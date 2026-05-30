"use client";

import { useState, useCallback, useRef } from "react";
import { streamChat, ChatSource } from "../services/api";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  isStreaming?: boolean;
  timestamp: Date;
}

interface UseChatReturn {
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  isStreaming: boolean;
  error: string | null;
  clearMessages: () => void;
}

let msgCounter = 0;
const newId = () => `msg_${++msgCounter}_${Date.now()}`;

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionId = useRef(`session_${Date.now()}`);

  const sendMessage = useCallback(async (text: string) => {
    if (isStreaming || !text.trim()) return;
    setError(null);

    const userMsg: ChatMessage = {
      id: newId(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    const assistantId = newId();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      isStreaming: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    try {
      let accumulatedContent = "";
      let sources: ChatSource[] = [];

      for await (const event of streamChat(text.trim(), sessionId.current)) {
        if (event.type === "token" && event.content) {
          accumulatedContent += event.content;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: accumulatedContent }
                : m
            )
          );
        } else if (event.type === "sources" && event.sources) {
          sources = event.sources;
        } else if (event.type === "done") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: accumulatedContent, isStreaming: false, sources }
                : m
            )
          );
          break;
        } else if (event.type === "error") {
          throw new Error(event.content || "Stream error");
        }
      }
    } catch (e: any) {
      setError(e.message || "Chat failed");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: "Sorry, something went wrong. Please try again.",
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    sessionId.current = `session_${Date.now()}`;
  }, []);

  return { messages, sendMessage, isStreaming, error, clearMessages };
}
