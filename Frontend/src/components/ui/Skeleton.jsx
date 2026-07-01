export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded ${className}`} style={{ background: "#E2E8F0" }} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border p-4 space-y-3" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-6 w-1/3" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F0F9FF" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: "#BFDBFE", borderTopColor: "#2563EB" }} />
        <p className="text-sm" style={{ color: "#64748B" }}>Memuat...</p>
      </div>
    </div>
  );
}
