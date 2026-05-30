"use client";

import { VideoMetadata } from "../services/api";
import { Eye, Heart, MessageCircle, Users, Clock, Hash, Youtube, Instagram, TrendingUp, Hexagon } from "lucide-react";

interface VideoCardProps {
  video: VideoMetadata;
}

function formatNumber(n: number | null): string {
  if (n === null || n === undefined) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoCard({ video }: VideoCardProps) {
  const isA = video.video_id === "A";
  const accentColor = isA ? "var(--video-a)" : "var(--video-b)";
  const Icon = video.source === "youtube" ? Youtube : Instagram;
  const label = isA ? "SOURCE_ALPHA" : "SOURCE_BETA";
  const platformLabel = video.source === "youtube" ? "YOUTUBE_DB" : "INSTAGRAM_DB";

  const engagementBarWidth = Math.min((video.engagement_rate ?? 0) * 5, 100);

  return (
    <div
      className="cyber-glass rounded-sm overflow-hidden animate-slide-up group"
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between bg-black/40 border-b border-[hsl(var(--border))] relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/0.05)] to-transparent pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div
            className="w-7 h-7 rounded-sm flex items-center justify-center border border-[hsl(var(--border))] bg-black/60 shadow-[0_0_10px_rgba(255,90,0,0.1)] group-hover:shadow-[0_0_15px_rgba(255,90,0,0.3)] transition-shadow"
          >
            <Icon size={12} style={{ color: `hsl(${accentColor})` }} />
          </div>
          <div>
            <span
              className="text-[10px] font-mono tracking-widest uppercase flex items-center gap-1"
              style={{ color: `hsl(${accentColor})` }}
            >
              <Hexagon size={8} /> {label}
            </span>
            <p className="text-[9px] font-mono tracking-widest text-[hsl(var(--muted-foreground))] uppercase">
              {platformLabel}
            </p>
          </div>
        </div>

        {video.engagement_rate !== null && (
          <div className="text-right relative z-10">
            <div className="flex items-center gap-1 justify-end">
              <TrendingUp size={10} style={{ color: `hsl(${accentColor})` }} />
              <span className="text-sm font-bold font-mono" style={{ color: `hsl(${accentColor})`, textShadow: `0 0 8px hsl(${accentColor}/0.5)` }}>
                {video.engagement_rate.toFixed(2)}%
              </span>
            </div>
            <p className="text-[8px] font-mono tracking-widest text-[hsl(var(--muted-foreground))] uppercase">
              VITAL_SIGNS
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Title & Creator */}
        <div>
          <h3
            className="font-mono text-xs leading-relaxed line-clamp-2 mb-1 text-[hsl(var(--foreground))] uppercase tracking-wide"
          >
            {video.title}
          </h3>
          <p className="text-[10px] font-mono tracking-widest text-[hsl(var(--primary))] opacity-80 uppercase">
            // {video.creator_name}
          </p>
        </div>

        {/* Engagement bar */}
        {video.engagement_rate !== null && (
          <div>
            <div className="h-0.5 rounded-full overflow-hidden bg-[hsl(var(--border))] shadow-[inset_0_0_5px_rgba(0,0,0,1)]">
              <div
                className="h-full rounded-full transition-all duration-1000 delay-300 relative"
                style={{
                  width: `${engagementBarWidth}%`,
                  background: `linear-gradient(90deg, transparent, hsl(${accentColor}))`,
                }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white blur-[2px]" />
              </div>
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Eye, label: "VIEWS", value: formatNumber(video.views) },
            { icon: Heart, label: "LIKES", value: formatNumber(video.likes) },
            { icon: MessageCircle, label: "COMMENTS", value: formatNumber(video.comments) },
            { icon: Users, label: "FOLLOWERS", value: formatNumber(video.follower_count) },
            { icon: Clock, label: "DURATION", value: formatDuration(video.duration_seconds) },
            {
              icon: Hash,
              label: "HASHTAGS",
              value: video.hashtags.length > 0 ? `${video.hashtags.length} tags` : "—",
            },
          ].map(({ icon: StatIcon, label: statLabel, value }) => (
            <div
              key={statLabel}
              className="rounded-sm px-2 py-2 flex items-center gap-2 bg-black/50 border border-[hsl(var(--border))]"
            >
              <StatIcon size={10} style={{ color: `hsl(${accentColor}/0.7)` }} />
              <div className="min-w-0">
                <p className="text-[8px] font-mono tracking-widest text-[hsl(var(--muted-foreground))]">
                  {statLabel}
                </p>
                <p
                  className="text-[10px] font-mono tracking-wider text-[hsl(var(--foreground))]"
                >
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Hashtags */}
        {video.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[hsl(var(--border))]">
            {video.hashtags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="text-[9px] px-1.5 py-0.5 rounded-sm font-mono tracking-widest uppercase"
                style={{
                  background: `hsl(${accentColor} / 0.1)`,
                  color: `hsl(${accentColor})`,
                  border: `1px solid hsl(${accentColor} / 0.3)`,
                }}
              >
                {tag}
              </span>
            ))}
            {video.hashtags.length > 5 && (
              <span
                className="text-[9px] px-1.5 py-0.5 font-mono tracking-widest"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                +{video.hashtags.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Transcript status */}
        <div
          className="flex items-center gap-2 rounded-sm px-3 py-2 bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.2)]"
        >
          <div
            className="w-1.5 h-1.5 rounded-sm animate-pulse"
            style={{
              background: video.transcript
                ? `hsl(${accentColor})`
                : "hsl(var(--muted-foreground))",
              boxShadow: video.transcript ? `0 0 8px hsl(${accentColor})` : "none"
            }}
          />
          <span className="text-[9px] font-mono tracking-widest uppercase" style={{ color: video.transcript ? `hsl(${accentColor})` : "hsl(var(--muted-foreground))" }}>
            {video.transcript ? "NEURAL_NET: INDEXED" : "NEURAL_NET: OFFLINE"}
          </span>
        </div>
      </div>
    </div>
  );
}
