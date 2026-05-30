"use client";

export function VideoCardSkeleton() {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
      }}
    >
      {/* Header skeleton */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid hsl(var(--border))" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg skeleton" />
          <div className="space-y-1.5">
            <div className="h-2.5 w-16 rounded skeleton" />
            <div className="h-2 w-12 rounded skeleton" />
          </div>
        </div>
        <div className="space-y-1.5 text-right">
          <div className="h-5 w-16 rounded skeleton ml-auto" />
          <div className="h-2 w-12 rounded skeleton ml-auto" />
        </div>
      </div>

      {/* Body skeleton */}
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <div className="h-3 w-full rounded skeleton" />
          <div className="h-3 w-3/4 rounded skeleton" />
          <div className="h-2.5 w-1/3 rounded skeleton" />
        </div>

        <div className="h-1 w-full rounded-full skeleton" />

        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg px-3 py-2 flex items-center gap-2"
              style={{ background: "hsl(var(--muted))" }}
            >
              <div className="w-3 h-3 rounded skeleton flex-shrink-0" />
              <div className="space-y-1 flex-1">
                <div className="h-2 w-12 rounded skeleton" />
                <div className="h-2.5 w-16 rounded skeleton" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-5 w-16 rounded-full skeleton" />
          ))}
        </div>

        <div className="h-8 rounded-lg skeleton" />
      </div>
    </div>
  );
}
