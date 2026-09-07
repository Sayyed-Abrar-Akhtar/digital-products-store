export default function Loading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-20 flex justify-center items-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Loading content...
        </p>
      </div>
    </div>
  );
}
