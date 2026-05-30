"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getVideos } from "./services/api";
import { AnalyzeForm } from "./components/AnalyzeForm";
import { VideoCard } from "./components/VideoCard";
import { VideoCardSkeleton } from "./components/VideoCardSkeleton";
import { ChatWindow } from "./components/ChatWindow";
import { EngagementComparison } from "./components/EngagementComparison";
import { ErrorState } from "./components/StateComponents";
import { BackgroundEffects } from "./components/BackgroundEffects";
import { SystemStatusPanel } from "./components/SystemStatusPanel";
import { DashboardPanels } from "./components/DashboardPanels";
import { RefreshCw, Youtube, Instagram, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { BrandLogo } from "./components/BrandLogo";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-[30px] h-[30px]"></div>;
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex items-center justify-center p-2 rounded-sm border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--border)/0.2)] transition-all z-10"
      title="Toggle Theme"
    >
      {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false);

  const {
    data: videos,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["videos"],
    queryFn: getVideos,
    enabled: showDashboard,
  });

  const videoA = videos?.find((v) => v.video_id === "A");
  const videoB = videos?.find((v) => v.video_id === "B");
  const hasVideos = !!videoA && !!videoB;

  return (
    <>
      {/* Deep Cyberpunk Background */}
      <BackgroundEffects />

      <AnimatePresence mode="wait">
        {!showDashboard ? (
          <motion.main
            key="hero"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="min-h-screen flex items-center justify-center px-4 py-12 relative"
          >
            <div className="absolute top-6 right-6 z-50">
              <ThemeToggle />
            </div>
            <AnalyzeForm onAnalysisComplete={() => setShowDashboard(true)} />
          </motion.main>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen flex flex-col relative z-10"
          >
            {/* Top nav */}
            <header
              className="flex items-center justify-between px-6 py-3.5 flex-shrink-0 sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-[hsl(var(--border))]"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.5)] to-transparent" />
              <div className="flex items-center gap-4 relative z-10">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-[hsl(var(--primary)/0.5)] shadow-[0_0_15px_rgba(255,0,0,0.2)] bg-black/40 backdrop-blur-sm"
                >
                  <BrandLogo size={20} />
                </motion.div>
                <div className="flex flex-col">
                  <span className="font-display italic text-xl tracking-wider text-[hsl(var(--foreground))] drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                    ReelRAG
                  </span>
                  <span className="text-[9px] font-mono tracking-[0.2em] text-[hsl(var(--primary))] uppercase">
                    AI Command Center
                  </span>
                </div>

                {hasVideos && (
                  <div className="hidden md:flex items-center gap-3 ml-6 pl-6 border-l border-[hsl(var(--border))]">
                    <span className="source-badge-a flex items-center gap-1.5 text-xs px-3 py-1 rounded-sm">
                      {videoA.source === "youtube" ? <Youtube size={12} /> : <Instagram size={12} />}
                      {videoA.title.length > 28
                        ? videoA.title.slice(0, 28) + "…"
                        : videoA.title}
                    </span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      // VS //
                    </span>
                    <span className="source-badge-b flex items-center gap-1.5 text-xs px-3 py-1 rounded-sm">
                      {videoB.source === "youtube" ? <Youtube size={12} /> : <Instagram size={12} />}
                      {videoB.title.length > 28
                        ? videoB.title.slice(0, 28) + "…"
                        : videoB.title}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <ThemeToggle />
                <button
                  onClick={() => setShowDashboard(false)}
                  className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase px-4 py-2 rounded-sm transition-all bg-[hsl(var(--accent)/0.1)] hover:bg-[hsl(var(--accent)/0.2)] border border-[hsl(var(--accent)/0.5)] text-[hsl(var(--accent))] hover:shadow-[0_0_15px_rgba(255,45,32,0.3)] relative z-10"
                >
                  <RefreshCw size={12} />
                  TERMINATE SESSION
                </button>
              </div>
            </header>

            {/* Main content */}
            <div className="flex-1 flex flex-col xl:flex-row overflow-hidden relative">
              {/* Left Column: Command Center Panels & Video Streams */}
              <div className="flex-1 flex flex-col overflow-y-auto p-5 border-r border-[hsl(var(--border))] cyber-glass border-t-0 border-b-0 border-l-0 rounded-none">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[hsl(var(--primary))] drop-shadow-[0_0_5px_rgba(255,107,0,0.5)]">
                    Global Telemetry
                  </p>
                </div>

                {isLoading && (
                  <div className="grid grid-cols-2 gap-4">
                    <VideoCardSkeleton />
                    <VideoCardSkeleton />
                  </div>
                )}

                {isError && (
                  <ErrorState
                    message={
                      error instanceof Error
                        ? error.message
                        : "Failed to load telemetry data"
                    }
                    onRetry={() => refetch()}
                  />
                )}

                {!isLoading && !isError && videoA && videoB && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ staggerChildren: 0.1 }}
                  >
                    <DashboardPanels videoA={videoA} videoB={videoB} />
                    
                    <div className="grid lg:grid-cols-2 gap-5 mt-5">
                      <VideoCard video={videoA} />
                      <VideoCard video={videoB} />
                    </div>
                    
                    <div className="mt-5">
                      <EngagementComparison videoA={videoA} videoB={videoB} />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Right Column: Neural Chat Terminal */}
              <aside className="w-full xl:w-[450px] flex-shrink-0 p-5 overflow-hidden flex flex-col relative z-10">
                 <ChatWindow />
              </aside>
            </div>
            <SystemStatusPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
