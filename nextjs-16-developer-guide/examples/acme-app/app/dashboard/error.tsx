"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Acme Dashboard Error:", error.message, "Digest:", error.digest);
  }, [error]);

  return (
    <div className="p-8 max-w-lg mx-auto my-12 border border-red-800 bg-red-950/40 rounded-xl text-center space-y-4 text-white">
      <h2 className="text-2xl font-bold text-red-400">Dashboard Exception</h2>
      <p className="text-sm text-slate-300">
        An unhandled runtime error occurred loading telemetry data.
      </p>

      {error.digest && (
        <p className="text-xs font-mono bg-slate-900 p-2 rounded text-slate-400">
          Ref Digest: {error.digest}
        </p>
      )}

      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md"
      >
        Retry
      </button>
    </div>
  );
}
