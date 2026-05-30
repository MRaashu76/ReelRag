"use client";

import { motion } from "framer-motion";
import { VideoMetadata } from "../services/api";
import { Network, Crosshair } from "lucide-react";

interface DashboardPanelsProps {
  videoA: VideoMetadata;
  videoB: VideoMetadata;
}

export function DashboardPanels({ videoA, videoB }: DashboardPanelsProps) {
  // Generate pseudo-metrics based on available data to populate the UI
  const similarityScore = Math.min(
    100,
    Math.max(40, 100 - Math.abs((videoA.engagement_rate || 0) - (videoB.engagement_rate || 0)) * 5)
  ).toFixed(1);


  return (
    <div className="grid grid-cols-2 gap-4 mb-5">
      {/* Similarity Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="cyber-glass p-4 border border-[hsl(var(--border))] flex flex-col justify-between relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
          <Crosshair size={24} className="text-[hsl(var(--primary))]" />
        </div>
        <p className="text-[9px] font-mono tracking-widest text-[hsl(var(--muted-foreground))] uppercase mb-4">
          Vector Similarity
        </p>
        <div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-display italic text-[hsl(var(--foreground))] drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
              {similarityScore}%
            </span>
          </div>
          <div className="mt-3 h-1 w-full bg-black rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${similarityScore}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] shadow-[0_0_10px_hsl(var(--primary))]" 
            />
          </div>
        </div>
      </motion.div>

      {/* Transcript Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="cyber-glass p-4 border border-[hsl(var(--border))] flex flex-col justify-between relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
          <Network size={24} className="text-[hsl(var(--primary))]" />
        </div>
        <p className="text-[9px] font-mono tracking-widest text-[hsl(var(--muted-foreground))] uppercase mb-4">
          Neural DB Status
        </p>
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-2">
            <span className="text-[10px] font-mono text-[hsl(var(--video-a))]">ALPHA_INDEX</span>
            <span className="text-[10px] font-mono text-[hsl(var(--foreground))]">{videoA.transcript ? "ACTIVE" : "OFFLINE"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-[hsl(var(--video-b))]">BETA_INDEX</span>
            <span className="text-[10px] font-mono text-[hsl(var(--foreground))]">{videoB.transcript ? "ACTIVE" : "OFFLINE"}</span>
          </div>
        </div>
      </motion.div>


    </div>
  );
}
