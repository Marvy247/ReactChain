export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-app-border rounded-xl ${className}`} />
  );
}

export function GroupCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 border border-app-border flex flex-col gap-4">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16 col-span-2" />
      </div>
      <Skeleton className="h-10" />
    </div>
  );
}
