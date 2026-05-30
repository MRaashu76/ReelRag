"use client";

import { VideoMetadata } from "../services/api";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";

interface EngagementComparisonProps {
  videoA: VideoMetadata;
  videoB: VideoMetadata;
}

function MetricRow({
  label,
  valueA,
  valueB,
  format,
}: {
  label: string;
  valueA: number | null;
  valueB: number | null;
  format?: (n: number) => string;
}) {
  const fmt = format ?? ((n: number) => n.toLocaleString());
  if (valueA === null && valueB === null) return null;

  const diff = valueA !== null && valueB !== null ? valueA - valueB : null;
  const winner = diff === null ? null : diff > 0 ? "A" : diff < 0 ? "B" : "tie";

  return (
    <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--border))]/50">
      <span className="text-[9px] font-mono tracking-widest uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>
        {label}
      </span>
      <div className="flex items-center gap-3">
        <span
          className="text-[10px] font-mono tracking-wider"
          style={{
            color: winner === "A" ? "hsl(var(--video-a))" : "hsl(var(--foreground))",
            textShadow: winner === "A" ? "0 0 5px hsl(var(--video-a))" : "none",
          }}
        >
          {valueA !== null ? fmt(valueA) : "—"}
        </span>
        <span className="text-[8px] font-mono tracking-widest text-[hsl(var(--muted-foreground))]">VS</span>
        <span
          className="text-[10px] font-mono tracking-wider"
          style={{
            color: winner === "B" ? "hsl(var(--video-b))" : "hsl(var(--foreground))",
            textShadow: winner === "B" ? "0 0 5px hsl(var(--video-b))" : "none",
          }}
        >
          {valueB !== null ? fmt(valueB) : "—"}
        </span>
        {winner === "A" && <TrendingUp size={10} style={{ color: "hsl(var(--video-a))" }} />}
        {winner === "B" && <TrendingDown size={10} style={{ color: "hsl(var(--video-b))" }} />}
        {winner === "tie" && <Minus size={10} style={{ color: "hsl(var(--muted-foreground))" }} />}
      </div>
    </div>
  );
}

export function EngagementComparison({ videoA, videoB }: EngagementComparisonProps) {
  const maxEngagement = Math.max(
    videoA.engagement_rate ?? 0,
    videoB.engagement_rate ?? 0
  );

  return (
    <div
      className="cyber-glass rounded-sm p-4 space-y-4 animate-slide-up"
      style={{ animationDelay: "100ms" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Activity size={12} className="text-[hsl(var(--primary))] animate-pulse" />
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[hsl(var(--primary))]">
          HEAD_TO_HEAD_ANALYSIS
        </p>
      </div>

      {/* Engagement rate bar comparison */}
      {videoA.engagement_rate !== null && videoB.engagement_rate !== null && (
        <div className="space-y-3">
          {[
            { label: "SOURCE_ALPHA", rate: videoA.engagement_rate, color: "var(--video-a)" },
            { label: "SOURCE_BETA", rate: videoB.engagement_rate, color: "var(--video-b)" },
          ].map(({ label, rate, color }) => (
            <div key={label} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[9px] font-mono tracking-widest" style={{ color: `hsl(${color})` }}>{label}</span>
                <span className="font-mono text-[10px] tracking-wider" style={{ color: "hsl(var(--foreground))", textShadow: `0 0 5px hsl(${color}/0.5)` }}>
                  {rate.toFixed(2)}%
                </span>
              </div>
              <div
                className="h-1 rounded-sm overflow-hidden bg-black shadow-[inset_0_0_5px_rgba(0,0,0,1)]"
              >
                <div
                  className="h-full rounded-sm transition-all duration-1000 delay-500 relative"
                  style={{
                    width: maxEngagement > 0 ? `${(rate / maxEngagement) * 100}%` : "0%",
                    background: `linear-gradient(90deg, transparent, hsl(${color}))`,
                  }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white blur-[2px]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metric table */}
      <div className="pt-2">
        <div className="flex items-center justify-between pb-2 mb-1 border-b border-[hsl(var(--primary)/0.2)]">
          <span className="text-[8px] font-mono tracking-widest text-[hsl(var(--muted-foreground))]">METRIC</span>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono font-bold tracking-widest" style={{ color: "hsl(var(--video-a))", textShadow: "0 0 5px hsl(var(--video-a)/0.5)" }}>ALPHA</span>
            <span className="text-[8px] font-mono tracking-widest text-[hsl(var(--muted-foreground))]">/</span>
            <span className="text-[10px] font-mono font-bold tracking-widest" style={{ color: "hsl(var(--video-b))", textShadow: "0 0 5px hsl(var(--video-b)/0.5)" }}>BETA</span>
            <span className="w-3" />
          </div>
        </div>
        <MetricRow label="VIEWS" valueA={videoA.views} valueB={videoB.views} />
        <MetricRow label="LIKES" valueA={videoA.likes} valueB={videoB.likes} />
        <MetricRow label="COMMENTS" valueA={videoA.comments} valueB={videoB.comments} />
        <MetricRow
          label="FOLLOWERS"
          valueA={videoA.follower_count}
          valueB={videoB.follower_count}
        />
        <MetricRow
          label="DURATION"
          valueA={videoA.duration_seconds}
          valueB={videoB.duration_seconds}
          format={(n) => `${Math.floor(n / 60)}:${(n % 60).toString().padStart(2, "0")}`}
        />
      </div>
    </div>
  );
}
