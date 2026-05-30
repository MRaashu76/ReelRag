"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Trash2, Hexagon, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useChat, ChatMessage } from "../hooks/useChat";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "./BrandLogo";

function SourceBadge({ videoId, chunkId }: { videoId: string; chunkId: number }) {
  const isA = videoId === "A";
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-sm font-mono tracking-widest uppercase ${
      isA ? "source-badge-a" : "source-badge-b"
    }`}>
      <Hexagon size={8} /> SRC_{videoId} // CHUNK_{chunkId}
    </span>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <motion.div 
      initial={{ opacity: 0, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className="w-8 h-8 rounded-sm flex-shrink-0 flex items-center justify-center mt-1 border"
        style={{
          background: isUser
            ? "hsl(var(--muted))"
            : "linear-gradient(135deg, hsl(var(--primary)/0.2), transparent)",
          borderColor: isUser ? "hsl(var(--border))" : "hsl(var(--primary)/0.5)",
          boxShadow: isUser ? "none" : "0 0 10px hsl(var(--primary)/0.2)",
        }}
      >
        {isUser
          ? <User size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
          : <Bot size={14} style={{ color: "hsl(var(--primary))" }} />}
      </div>

      <div className={`flex-1 max-w-[85%] space-y-2 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className="rounded-sm px-5 py-4 text-sm leading-relaxed border relative overflow-hidden"
          style={{
            background: isUser ? "hsl(var(--muted)/0.5)" : "hsl(var(--primary)/0.03)",
            borderColor: isUser ? "hsl(var(--border))" : "hsl(var(--primary)/0.3)",
            color: "hsl(var(--foreground))",
            boxShadow: isUser ? "none" : "inset 0 0 20px hsl(var(--primary)/0.02)",
          }}
        >
          {!isUser && <div className="absolute top-0 left-0 w-1 h-full bg-[hsl(var(--primary))] shadow-[0_0_8px_hsl(var(--primary))]" />}
          
          {isUser ? (
            <p className="font-mono font-semibold">{message.content}</p>
          ) : (
            <div
              className={`prose prose-invert prose-sm max-w-none font-mono font-semibold ${message.isStreaming ? "typing-cursor" : ""}`}
            >
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-[hsl(var(--foreground))]">{children}</p>,
                  strong: ({ children }) => (
                    <strong className="text-[hsl(var(--foreground))] drop-shadow-[0_0_2px_rgba(255,255,255,0.5)] font-bold">
                      {children}
                    </strong>
                  ),
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-3 space-y-2 marker:text-[hsl(var(--primary))]">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-3 space-y-2 marker:text-[hsl(var(--primary))]">{children}</ol>,
                  li: ({ children }) => <li className="text-[13px] text-[hsl(var(--foreground))]">{children}</li>,
                  code: ({ children }) => (
                    <code
                      className="px-1.5 py-0.5 rounded-sm text-[11px] font-mono border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
                    >
                      {children}
                    </code>
                  ),
                  h3: ({ children }) => (
                    <h3 className="font-bold text-sm mt-5 mb-2 text-[hsl(var(--primary))] tracking-wide uppercase">
                      {children}
                    </h3>
                  ),
                }}
              >
                {message.content || (message.isStreaming ? " " : "")}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-1">
            {message.sources.map((s) => (
              <SourceBadge
                key={`${s.video_id}_${s.chunk_id}`}
                videoId={s.video_id}
                chunkId={s.chunk_id}
              />
            ))}
          </div>
        )}

        <span className="text-[9px] font-mono tracking-widest px-1 uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>
          SYS_TIME: {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      </div>
    </motion.div>
  );
}

export function ChatWindow() {
  const { messages, sendMessage, isStreaming, error, clearMessages } = useChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="flex flex-col h-full rounded-sm overflow-hidden cyber-glass border border-[hsl(var(--border))]"
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between flex-shrink-0 bg-transparent relative overflow-hidden"
      >
        <div className="absolute inset-0 border-b border-[hsl(var(--border))]" />
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.5)] to-transparent" />
        
        <div className="flex items-center gap-3 relative z-10">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-[hsl(var(--primary)/0.5)] shadow-[0_0_10px_rgba(255,90,0,0.2)] bg-black/40"
          >
            <BrandLogo size={18} />
          </div>
          <div>
            <p className="text-xs font-mono font-bold tracking-widest uppercase text-[hsl(var(--foreground))] drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
              RAG_NEURAL_TERMINAL
            </p>
            <p className="text-[9px] font-mono tracking-widest uppercase text-[hsl(var(--muted-foreground))]">
              LANGGRAPH KERNEL // Llama-3 // AUTO-CITATION ENABLED
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="p-2 rounded-sm transition-all hover:bg-[hsl(var(--accent)/0.1)] hover:text-[hsl(var(--accent))] border border-transparent hover:border-[hsl(var(--accent)/0.3)] relative z-10"
            style={{ color: "hsl(var(--muted-foreground))" }}
            title="PURGE MEMORY"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 relative">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full gap-8 relative z-10"
            >
              <div className="text-center space-y-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border border-[hsl(var(--primary)/0.5)] shadow-[0_0_30px_rgba(255,90,0,0.15)] relative overflow-hidden group bg-black/40"
                >
                  <div className="absolute inset-0 bg-[hsl(var(--primary))] opacity-10 group-hover:opacity-20 transition-opacity" />
                  <BrandLogo size={32} />
                </div>
                <p className="font-mono text-sm tracking-[0.2em] uppercase text-[hsl(var(--foreground))] drop-shadow-md">
                  Terminal Online
                </p>
                <p className="text-[10px] font-mono tracking-widest max-w-xs text-[hsl(var(--muted-foreground))] uppercase">
                  AWAITING QUERY // CONTEXTUAL MEMORY LOADED
                </p>
              </div>
              <SuggestedQuestions onSelect={(q) => sendMessage(q)} disabled={isStreaming} />
            </motion.div>
          ) : (
            messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
          )}
        </AnimatePresence>

        {error && (
          <div
            className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase rounded-sm px-4 py-3 bg-[hsl(var(--accent)/0.1)] border border-[hsl(var(--accent)/0.3)] text-[hsl(var(--accent))]"
          >
            <AlertTriangle size={14} />
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-5 flex-shrink-0 bg-black/40 border-t border-[hsl(var(--border))] relative">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="AWAITING INPUT..."
            rows={1}
            disabled={isStreaming}
            className="flex-1 resize-none rounded-sm px-5 py-4 text-sm font-mono focus-ring transition-all bg-transparent border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))]"
            style={{
              minHeight: "52px",
              maxHeight: "120px",
            }}
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="w-[52px] h-[52px] rounded-sm flex items-center justify-center transition-all disabled:opacity-40 border border-[hsl(var(--primary)/0.5)] hover:shadow-[0_0_15px_rgba(255,90,0,0.3)] relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary))] to-[#ff3b00] opacity-80" />
            <Send size={16} className="relative z-10 text-[hsl(var(--foreground))] group-hover:scale-110 transition-transform" />
          </button>
        </div>
        <div className="flex justify-between items-center mt-3 px-1">
          <p className="text-[9px] font-mono tracking-widest text-[hsl(var(--muted-foreground))] uppercase">
            ENTER: EXECUTE_QUERY // SHIFT+ENTER: NEW_LINE
          </p>
          <div className="flex gap-1">
            <div className="w-2 h-1 bg-[hsl(var(--primary))] opacity-50" />
            <div className="w-4 h-1 bg-[hsl(var(--primary))] opacity-70" />
            <div className="w-2 h-1 bg-[hsl(var(--primary))] opacity-30" />
          </div>
        </div>
      </div>
    </div>
  );
}
