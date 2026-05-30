"use client";

import { motion } from "framer-motion";
import { Cpu, Database, Activity, BrainCircuit, Settings2 } from "lucide-react";
import { useState, useEffect } from "react";

const STATUS_ITEMS = [
  { label: "AI CORE", icon: BrainCircuit, activeColor: "var(--primary)" },
  { label: "VECTOR DB", icon: Database, activeColor: "var(--primary)" },
  { label: "MEMORY", icon: Activity, activeColor: "var(--accent)" },
  { label: "ENGINE", icon: Cpu, activeColor: "var(--primary)" },
];

export function SystemStatusPanel() {
  const [mounted, setMounted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className={`fixed bottom-6 left-6 z-50 cyber-glass border border-[hsl(var(--border))] flex flex-col gap-3 transition-all ${isMinimized ? 'p-3 cursor-pointer hover:border-[hsl(var(--primary)/0.5)]' : 'p-4'}`}
      style={{ background: "hsl(var(--card) / 0.8)", minWidth: isMinimized ? "auto" : "160px" }}
      onClick={() => isMinimized && setIsMinimized(false)}
    >
      {isMinimized ? (
        <div className="flex items-center justify-center">
          <Settings2 size={18} className="text-[hsl(var(--primary))] animate-pulse" />
        </div>
      ) : (
        <>
          <div 
            className="flex items-center justify-between cursor-pointer border-b border-[hsl(var(--border))] pb-2 mb-1"
            onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
          >
            <p className="text-[9px] font-mono font-bold tracking-[0.3em] uppercase text-[hsl(var(--muted-foreground))]">
              System_Status
            </p>
            <div className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors font-bold">
              -
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex flex-col gap-2.5 overflow-hidden"
          >
          {STATUS_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-4 h-4">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    className="absolute inset-0 rounded-full"
                    style={{ background: `hsl(${item.activeColor} / 0.2)` }}
                  />
                  <Icon size={10} style={{ color: `hsl(${item.activeColor})` }} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono tracking-widest text-[hsl(var(--foreground))]">
                    {item.label}
                  </span>
                  <span className="text-[8px] font-mono tracking-widest uppercase" style={{ color: `hsl(${item.activeColor})` }}>
                    ONLINE
                  </span>
                </div>
              </div>
            );
          })}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
