"use client";

import { MessageSquare, Hexagon } from "lucide-react";
import { motion } from "framer-motion";

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
}

const QUESTIONS = [
  {
    category: "PERFORMANCE_METRICS",
    items: [
      "Why did SOURCE_ALPHA perform better than SOURCE_BETA?",
      "Compare the engagement rates of both videos",
    ],
  },
  {
    category: "CONTENT_ANALYSIS",
    items: [
      "Compare the hooks in the first 5 seconds",
      "Compare the storytelling techniques used",
      "How do the CTAs differ between the two videos?",
    ],
  },
  {
    category: "CREATOR_TELEMETRY",
    items: [
      "Who created each video and what are their follower counts?",
      "Suggest 3 improvements for SOURCE_BETA",
    ],
  },
];

export function SuggestedQuestions({ onSelect, disabled }: SuggestedQuestionsProps) {
  return (
    <div className="space-y-6 w-full max-w-lg relative z-10">
      <div className="flex items-center gap-2 border-b border-[hsl(var(--primary)/0.3)] pb-2">
        <Hexagon size={12} className="text-[hsl(var(--primary))] animate-spin-slow" />
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[hsl(var(--primary))] drop-shadow-[0_0_5px_rgba(255,90,0,0.5)]">
          SUGGESTED_QUERIES
        </span>
      </div>

      {QUESTIONS.map(({ category, items }, i) => (
        <motion.div 
          key={category} 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-[hsl(var(--muted-foreground))]" />
            <p className="text-[9px] font-mono tracking-widest text-[hsl(var(--muted-foreground))]">
              {category}
            </p>
          </div>
          <div className="space-y-2">
            {items.map((q) => (
              <button
                key={q}
                onClick={() => onSelect(q)}
                disabled={disabled}
                className="w-full text-left text-xs font-mono px-4 py-3 rounded-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed group relative overflow-hidden bg-black/40 border border-[hsl(var(--border))]"
              >
                <div className="absolute inset-0 bg-[hsl(var(--primary))] opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[hsl(var(--primary))] shadow-[0_0_8px_hsl(var(--primary))] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <span className="relative z-10 text-[hsl(var(--foreground))] group-hover:text-white transition-colors">
                  {q}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
