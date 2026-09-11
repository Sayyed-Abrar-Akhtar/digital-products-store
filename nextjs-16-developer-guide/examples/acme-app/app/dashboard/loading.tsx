export default function DashboardLoading() {
  return (
    <div className="p-8 space-y-6 animate-pulse text-white">
      <div className="h-8 w-64 bg-slate-800 rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-800 rounded-xl p-4 space-y-3">
            <div className="h-4 w-1/2 bg-slate-700 rounded" />
            <div className="h-8 w-3/4 bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
