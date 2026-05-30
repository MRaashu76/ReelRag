"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, Youtube, Instagram, Cpu, Database, Hexagon, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface ProcessingOverlayProps {
  progress: string;
  status: "processing" | "completed" | "error";
  error?: string;
}

const STEPS = [
  { icon: Youtube, label: "EXTRACT YOUTUBE METRICS & TRANSCRIPT" },
  { icon: Instagram, label: "DOWNLOAD & TRANSCRIBE REEL" },
  { icon: Cpu, label: "GENERATE EMBEDDINGS // BAAI/BGE" },
  { icon: Database, label: "INDEX CHUNKS // CHROMADB" },
  { icon: Hexagon, label: "RAG PIPELINE ONLINE" },
];

export function ProcessingOverlay({ progress, status, error }: ProcessingOverlayProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (status !== "processing") return;
    const lower = progress.toLowerCase();
    if (lower.includes("youtube")) setActiveStep(0);
    else if (lower.includes("instagram")) setActiveStep(1);
    else if (lower.includes("embed") || lower.includes("index") && activeStep < 2) setActiveStep(2);
    else if (lower.includes("chromadb") || lower.includes("index")) setActiveStep(3);
    else if (lower.includes("complete")) setActiveStep(4);
  }, [progress, status, activeStep]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,90,0,0.1)_0%,transparent_70%)]" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="rounded-sm p-8 w-full max-w-lg space-y-8 cyber-glass border border-[hsl(var(--primary)/0.5)] shadow-[0_0_50px_rgba(255,90,0,0.15)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-[hsl(var(--primary))] shadow-[0_0_10px_hsl(var(--primary))]" />
        
        {/* Header */}
        <div className="text-center space-y-4">
          {status === "error" ? (
            <AlertTriangle size={48} className="mx-auto text-[hsl(var(--accent))] animate-pulse" />
          ) : status === "completed" ? (
            <CheckCircle2 size={48} className="mx-auto text-[hsl(var(--primary))]" />
          ) : (
            <div className="relative w-20 h-20 mx-auto">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-[hsl(var(--primary)/0.3)] border-t-[hsl(var(--primary))] rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 border border-[hsl(var(--accent)/0.3)] border-b-[hsl(var(--accent))] rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Hexagon size={24} className="text-[hsl(var(--primary))] animate-pulse" />
              </div>
            </div>
          )}
          
          <div>
            <h2 className="font-mono text-xl tracking-[0.2em] uppercase text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
              {status === "error"
                ? "SYSTEM_FAILURE"
                : status === "completed"
                ? "INITIALIZATION_COMPLETE"
                : "PROCESSING_SEQUENCE"}
            </h2>
            <p className="text-[10px] font-mono tracking-widest text-[hsl(var(--primary))] mt-2 uppercase">
              {status === "error"
                ? error || "UNKNOWN FATAL EXCEPTION"
                : status === "completed"
                ? "TELEMETRY & NEURAL NET ONLINE"
                : progress || "INITIALIZING KERNEL..."}
            </p>
          </div>
        </div>

        {/* Step tracker */}
        {status !== "error" && (
          <div className="space-y-3">
            {STEPS.map((step, i) => {
              const StepIcon = step.icon;
              const isDone = status === "completed" || i < activeStep;
              const isActive = i === activeStep && status === "processing";

              return (
                <div
                  key={step.label}
                  className="flex items-center gap-4 rounded-sm px-4 py-3 relative overflow-hidden"
                  style={{
                    background: isActive ? "hsl(var(--primary) / 0.1)" : "transparent",
                    border: `1px solid ${
                      isActive ? "hsl(var(--primary) / 0.5)" : "hsl(var(--border) / 0.5)"
                    }`,
                    opacity: i > activeStep && status !== "completed" ? 0.3 : 1,
                  }}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[hsl(var(--primary))] shadow-[0_0_8px_hsl(var(--primary))]" />}
                  
                  {isDone ? (
                    <CheckCircle2 size={16} style={{ color: "hsl(var(--primary))", flexShrink: 0 }} />
                  ) : isActive ? (
                    <Loader2
                      size={16}
                      className="animate-spin flex-shrink-0"
                      style={{ color: "hsl(var(--primary))" }}
                    />
                  ) : (
                    <StepIcon size={16} style={{ color: "hsl(var(--muted-foreground))", flexShrink: 0 }} />
                  )}
                  <span
                    className="text-[10px] font-mono tracking-widest"
                    style={{
                      color: isActive ? "white" : isDone ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                      textShadow: isActive ? "0 0 5px rgba(255,255,255,0.5)" : "none",
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Disclaimer */}
        {status === "processing" && (
          <div className="text-center">
            <p className="text-[8px] font-mono tracking-[0.2em] text-[hsl(var(--accent))] uppercase animate-pulse">
              WARNING: NEURAL TRANSCRIPTION (WHISPER) REQUIRES HIGH CPU LOAD
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
