"use client";

import { useState, useEffect } from "react";
import { Youtube, Instagram, Hexagon, AlertTriangle, Cpu, Network, Database, BrainCircuit, ScanLine } from "lucide-react";
import { useAnalyze } from "../hooks/useAnalyze";
import { ProcessingOverlay } from "./ProcessingOverlay";
import { motion } from "framer-motion";

interface AnalyzeFormProps {
  onAnalysisComplete: () => void;
}

export function AnalyzeForm({ onAnalysisComplete }: AnalyzeFormProps) {
  const [videoAUrl, setVideoAUrl] = useState("");
  const [videoBUrl, setVideoBUrl] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    videoA?: string;
    videoB?: string;
  }>({});

  const { analyze, status, isAnalyzing, error } = useAnalyze();

  const validateUrl = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be") || url.includes("instagram.com");
  };

  const validate = () => {
    const errors: { videoA?: string; videoB?: string } = {};
    if (!validateUrl(videoAUrl)) {
      errors.videoA = "Invalid YouTube or Instagram Source";
    }
    if (!validateUrl(videoBUrl)) {
      errors.videoB = "Invalid YouTube or Instagram Source";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await analyze(videoAUrl, videoBUrl);
  };

  useEffect(() => {
    if (status?.status === "completed") {
      onAnalysisComplete();
    }
  }, [status?.status, onAnalysisComplete]);

  if (status?.status === "completed") {
    return null;
  }

  if (isAnalyzing && status) {
    return (
      <ProcessingOverlay
        progress={status.progress}
        status={status.status as "processing" | "completed" | "error"}
        error={status.error}
      />
    );
  }

  return (
    <motion.div 
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-4xl mx-auto relative z-10 px-4"
    >
      {/* Central AI Core Background Effect behind the header */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[20%] w-[500px] h-[500px] pointer-events-none opacity-40 mix-blend-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-[hsl(var(--primary)/0.2)] border-dashed"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute inset-10 rounded-full border border-[hsl(var(--accent)/0.1)] border-dotted"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.15)_0%,transparent_50%)]" />
      </div>

      {/* Header */}
      <div className="text-center mb-16 relative">
        <motion.div
          animate={{ boxShadow: ["0 0 10px rgba(255,107,0,0.2)", "0 0 20px rgba(255,107,0,0.6)", "0 0 10px rgba(255,107,0,0.2)"] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm text-xs font-mono tracking-[0.3em] uppercase mb-8 bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.5)]"
        >
          <BrainCircuit size={14} className="animate-pulse" />
          AI Intelligence Core
        </motion.div>
        
        <h1 className="text-6xl md:text-8xl font-display italic mb-6 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-black to-gray-800 drop-shadow-[0_0_15px_rgba(0,0,0,0.1)]">
          ReelRAG
        </h1>
        <p className="text-sm md:text-base font-mono tracking-[0.3em] text-[hsl(var(--primary))] drop-shadow-[0_0_5px_rgba(255,107,0,0.5)] uppercase">
          AI-Powered Multi-Platform Video Intelligence
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-8">
          {/* YouTube Input Module */}
          <div className="relative group cyber-glass p-1">
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[hsl(var(--primary))] opacity-50 group-hover:opacity-100" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[hsl(var(--primary))] opacity-50 group-hover:opacity-100" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[hsl(var(--primary))] opacity-50 group-hover:opacity-100" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[hsl(var(--primary))] opacity-50 group-hover:opacity-100" />
            
            <div className="p-5 bg-black/60 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-[hsl(var(--primary))] opacity-20 group-hover:opacity-40" />
              <div className="absolute top-0 left-0 w-full h-[1px] bg-[hsl(var(--primary))] opacity-0 group-hover:opacity-100 group-hover:animate-pulse" />
              
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 text-xs font-mono tracking-widest text-[hsl(var(--primary))] drop-shadow-[0_0_5px_rgba(255,107,0,0.5)]">
                  {videoAUrl.includes('instagram.com') ? <Instagram size={14} /> : videoAUrl.includes('youtu') ? <Youtube size={14} /> : <ScanLine size={14} />}
                  SOURCE_ALPHA // {videoAUrl.includes('instagram.com') ? 'INSTAGRAM' : videoAUrl.includes('youtu') ? 'YOUTUBE' : 'AUTO-DETECT'}
                </label>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
                  <span className="text-[9px] font-mono tracking-widest text-[hsl(var(--primary))]">ONLINE</span>
                </div>
              </div>
              <div className="relative">
                <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] opacity-50" size={16} />
                <input
                  type="url"
                  value={videoAUrl}
                  onChange={(e) => {
                    setVideoAUrl(e.target.value);
                    setValidationErrors((p) => ({ ...p, videoA: undefined }));
                  }}
                  placeholder="https://youtube.com/... or https://instagram.com/..."
                  className="w-full pl-10 pr-5 py-4 rounded-lg text-sm font-mono bg-transparent border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] transition-all text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))]/50 shadow-[inset_0_0_10px_rgba(0,0,0,0.05)] focus:shadow-[inset_0_0_15px_rgba(255,107,0,0.05),0_0_15px_rgba(255,107,0,0.1)]"
                  disabled={isAnalyzing}
                />
              </div>
              {validationErrors.videoA && (
                <p className="text-[10px] font-mono tracking-wider flex items-center gap-1 text-[hsl(var(--accent))] mt-3">
                  <AlertTriangle size={10} />
                  {validationErrors.videoA}
                </p>
              )}
            </div>
          </div>

          {/* Instagram Input Module */}
          <div className="relative group cyber-glass p-1">
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[hsl(var(--accent))] opacity-50 group-hover:opacity-100" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[hsl(var(--accent))] opacity-50 group-hover:opacity-100" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[hsl(var(--accent))] opacity-50 group-hover:opacity-100" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[hsl(var(--accent))] opacity-50 group-hover:opacity-100" />
            
            <div className="p-5 bg-black/60 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-[hsl(var(--accent))] opacity-20 group-hover:opacity-40" />
              <div className="absolute top-0 left-0 w-full h-[1px] bg-[hsl(var(--accent))] opacity-0 group-hover:opacity-100 group-hover:animate-pulse" />
              
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 text-xs font-mono tracking-widest text-[hsl(var(--accent))] drop-shadow-[0_0_5px_rgba(255,45,32,0.5)]">
                  {videoBUrl.includes('instagram.com') ? <Instagram size={14} /> : videoBUrl.includes('youtu') ? <Youtube size={14} /> : <ScanLine size={14} />}
                  SOURCE_BETA // {videoBUrl.includes('instagram.com') ? 'INSTAGRAM' : videoBUrl.includes('youtu') ? 'YOUTUBE' : 'AUTO-DETECT'}
                </label>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))] animate-pulse" />
                  <span className="text-[9px] font-mono tracking-widest text-[hsl(var(--accent))]">ONLINE</span>
                </div>
              </div>
              <div className="relative">
                <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] opacity-50" size={16} />
                <input
                  type="url"
                  value={videoBUrl}
                  onChange={(e) => {
                    setVideoBUrl(e.target.value);
                    setValidationErrors((p) => ({ ...p, videoB: undefined }));
                  }}
                  placeholder="https://youtube.com/... or https://instagram.com/..."
                  className="w-full pl-10 pr-5 py-4 rounded-lg text-sm font-mono bg-transparent border border-[hsl(var(--border))] focus:border-[hsl(var(--accent))] transition-all text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))]/50 shadow-[inset_0_0_10px_rgba(0,0,0,0.05)] focus:shadow-[inset_0_0_15px_rgba(255,45,32,0.05),0_0_15px_rgba(255,45,32,0.1)]"
                  disabled={isAnalyzing}
                />
              </div>
              {validationErrors.videoB && (
                <p className="text-[10px] font-mono tracking-wider flex items-center gap-1 text-[hsl(var(--accent))] mt-3">
                  <AlertTriangle size={10} />
                  {validationErrors.videoB}
                </p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl p-4 flex items-start gap-3 bg-[hsl(var(--accent)/0.1)] border border-[hsl(var(--accent)/0.5)] shadow-[0_0_15px_rgba(255,45,32,0.2)]"
          >
            <AlertTriangle size={16} className="text-[hsl(var(--accent))] mt-0.5" />
            <p className="text-xs font-mono tracking-wide text-[hsl(var(--accent))]">{error}</p>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isAnalyzing}
          className="w-full py-6 rounded-2xl font-mono font-bold text-base tracking-[0.3em] relative overflow-hidden group disabled:opacity-50 border border-[hsl(var(--primary)/0.5)] cyber-glass"
        >
          {/* Animated reactor background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary))] via-[#FF2D20] to-[hsl(var(--accent))] opacity-60 group-hover:opacity-90 transition-opacity" />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
            animate={{ x: ["-200%", "200%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]" />
          
          <span className="relative flex items-center justify-center gap-3 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
            <Cpu size={20} className="group-hover:animate-pulse" />
            ⚡ INITIALIZE AI ANALYSIS
          </span>
        </motion.button>
      </form>

      {/* Results Preview Section */}
      <div className="mt-20 border-t border-[hsl(var(--border))] pt-16">
        <div className="text-center mb-12">
          <p className="text-xs font-mono tracking-[0.3em] text-[hsl(var(--muted-foreground))] uppercase">
            Platform Capabilities
          </p>
          <h3 className="text-2xl font-display italic mt-2 text-[hsl(var(--foreground))]">Advanced Analysis Modules</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { 
              label: "Transcript Intelligence", 
              desc: "Deep semantic analysis of video dialogue using Chunked Vector Memory.",
              icon: Database,
              metric: "7,432 nodes indexed",
              status: "READY"
            },
            { 
              label: "Engagement AI", 
              desc: "Cross-platform metric comparison and audience retention prediction.",
              icon: Network,
              metric: "Cross-platform sync",
              status: "ACTIVE"
            },
            { 
              label: "Memory Chat", 
              desc: "Contextual follow-ups based on the exact neural embeddings of the videos.",
              icon: BrainCircuit,
              metric: "Llama-3 Kernel",
              status: "STANDBY"
            },
          ].map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="rounded-2xl p-6 cyber-glass border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] transition-colors group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.2)] flex items-center justify-center text-[hsl(var(--primary))] group-hover:scale-110 transition-transform">
                  <f.icon size={18} />
                </div>
                <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full border border-[hsl(var(--border))]">
                  <div className={`w-1.5 h-1.5 rounded-full ${f.status === 'STANDBY' ? 'bg-[hsl(var(--muted-foreground))]' : 'bg-[hsl(var(--primary))] animate-pulse'}`} />
                  <span className="text-[8px] font-mono tracking-widest text-[hsl(var(--muted-foreground))]">{f.status}</span>
                </div>
              </div>
              
              <h4 className="text-sm font-mono tracking-widest text-[hsl(var(--foreground))] mb-2 uppercase">{f.label}</h4>
              <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed mb-6">
                {f.desc}
              </p>

              <div className="pt-4 border-t border-[hsl(var(--border))] flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-wider text-[hsl(var(--primary))]">{f.metric}</span>
                <Hexagon size={10} className="text-[hsl(var(--border))] group-hover:text-[hsl(var(--primary))] transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
