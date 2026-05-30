"use client";

import { AlertTriangle, RefreshCw, Hexagon } from "lucide-react";
import { motion } from "framer-motion";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "SYSTEM_FAILURE_DETECTED",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-sm p-6 flex flex-col items-center text-center gap-5 relative overflow-hidden bg-black/60 border border-[hsl(var(--accent)/0.5)] shadow-[0_0_20px_rgba(255,0,60,0.15)]"
    >
      <div className="absolute inset-0 bg-[hsl(var(--accent))] opacity-5 pointer-events-none" />
      
      <div className="relative">
        <div className="absolute inset-0 bg-[hsl(var(--accent))] blur-md opacity-20 animate-pulse" />
        <div
          className="w-12 h-12 rounded-sm flex items-center justify-center border border-[hsl(var(--accent))]"
          style={{ background: "hsl(var(--accent) / 0.1)" }}
        >
          <AlertTriangle size={20} style={{ color: "hsl(var(--accent))" }} />
        </div>
      </div>
      <div className="space-y-2 relative z-10">
        <p className="font-mono text-xs font-bold tracking-[0.2em] uppercase" style={{ color: "hsl(var(--accent))" }}>
          {title}
        </p>
        <p className="text-[10px] font-mono tracking-widest leading-relaxed max-w-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase px-4 py-2 rounded-sm transition-all bg-[hsl(var(--accent)/0.1)] hover:bg-[hsl(var(--accent)/0.2)] border border-[hsl(var(--accent)/0.5)] hover:shadow-[0_0_15px_rgba(255,0,60,0.3)] relative z-10"
          style={{
            color: "hsl(var(--accent))",
          }}
        >
          <RefreshCw size={12} />
          INITIATE_RETRY_SEQUENCE
        </button>
      )}
    </motion.div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div
      className="rounded-sm p-8 flex flex-col items-center text-center gap-4 bg-black/40 border border-dashed border-[hsl(var(--border))]"
    >
      {icon && (
        <div
          className="w-12 h-12 rounded-sm flex items-center justify-center border border-[hsl(var(--border))]"
          style={{ background: "hsl(var(--muted))" }}
        >
          {icon}
        </div>
      )}
      <div className="space-y-2">
        <p className="font-mono text-xs font-bold tracking-[0.2em] uppercase" style={{ color: "hsl(var(--foreground))" }}>
          {title}
        </p>
        {description && (
          <p className="text-[10px] font-mono tracking-widest uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
