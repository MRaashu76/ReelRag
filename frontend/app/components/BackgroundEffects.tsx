"use client";

import { motion } from "framer-motion";

export function BackgroundEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {/* Moving light streaks */}
      <motion.div
        initial={{ x: "-100%", y: "20%", opacity: 0 }}
        animate={{ x: "200%", y: "80%", opacity: [0, 0.5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear", delay: 2 }}
        className="absolute w-96 h-[1px] bg-gradient-to-r from-transparent via-[hsl(var(--primary))] to-transparent rotate-45 blur-sm"
      />
      
      {/* Volumetric Smoke / Clouds */}
      <motion.div
        animate={{
          x: ["-20%", "40%", "-20%"],
          y: ["-10%", "30%", "-10%"],
          scale: [1, 1.4, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[70vw] h-[70vh] bg-[hsl(var(--primary))] opacity-[0.20] blur-[100px] rounded-full top-[-10%] left-[-10%] pointer-events-none"
      />
      <motion.div
        animate={{
          x: ["20%", "-40%", "20%"],
          y: ["10%", "-30%", "10%"],
          scale: [1.2, 0.8, 1.2],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[60vw] h-[60vh] bg-[hsl(var(--accent))] opacity-[0.20] blur-[100px] rounded-full bottom-[-10%] right-[-10%] pointer-events-none"
      />
      <motion.div
        animate={{
          x: ["-30%", "30%", "-30%"],
          y: ["30%", "-30%", "30%"],
          scale: [1.1, 1.5, 1.1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[80vw] h-[80vh] bg-gradient-to-tr from-[hsl(var(--primary))] to-[hsl(var(--accent))] opacity-[0.15] blur-[120px] rounded-full top-[10%] left-[10%] pointer-events-none"
      />

      {/* Floating geometric particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: ["0%", "-20%", "0%"],
            x: ["0%", i % 2 === 0 ? "5%" : "-5%", "0%"],
            rotate: [0, 90, 180],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute"
          style={{
            top: `${10 + i * 12}%`,
            left: `${10 + i * 10}%`,
            width: i % 3 === 0 ? "4px" : "2px",
            height: i % 3 === 0 ? "4px" : "2px",
            background: i % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--accent))",
            boxShadow: `0 0 10px ${i % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--accent))"}`,
          }}
        />
      ))}

      {/* Neural network connection lines (static abstract) */}
      <svg className="absolute inset-0 w-full h-full opacity-10 mix-blend-screen" xmlns="http://www.w3.org/2000/svg">
        <path d="M 100 200 L 300 400 L 800 200" stroke="hsl(var(--primary))" strokeWidth="0.5" fill="none" />
        <path d="M 300 400 L 500 700 L 900 600" stroke="hsl(var(--accent))" strokeWidth="0.5" fill="none" />
        <path d="M 50 800 L 400 900 L 700 750" stroke="hsl(var(--primary))" strokeWidth="0.5" fill="none" />
        <circle cx="100" cy="200" r="2" fill="hsl(var(--primary))" />
        <circle cx="300" cy="400" r="2" fill="hsl(var(--accent))" />
        <circle cx="800" cy="200" r="2" fill="hsl(var(--primary))" />
        <circle cx="500" cy="700" r="2" fill="hsl(var(--primary))" />
        <circle cx="900" cy="600" r="2" fill="hsl(var(--accent))" />
        <circle cx="50" cy="800" r="2" fill="hsl(var(--primary))" />
        <circle cx="400" cy="900" r="2" fill="hsl(var(--accent))" />
        <circle cx="700" cy="750" r="2" fill="hsl(var(--primary))" />
      </svg>
    </div>
  );
}
