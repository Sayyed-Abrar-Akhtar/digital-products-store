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
    console.error("Caught error in Dashboard boundary:", error);
  }, [error]);

  return (
    <div style={{ padding: "1.5rem", border: "1px solid #fca5a5", background: "#fef2f2", borderRadius: "8px" }}>
      <h2 style={{ color: "#991b1b", margin: "0 0 0.5rem 0", fontSize: "1.2rem" }}>Dashboard Error Boundary</h2>
      <p style={{ color: "#7f1d1d", fontSize: "0.9rem", margin: "0 0 1rem 0" }}>
        {error.message || "An unexpected error occurred while rendering this dashboard view."}
      </p>
      <button
        onClick={() => reset()}
        type="button"
        style={{
          padding: "6px 16px",
          background: "#dc2626",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: 600
        }}
      >
        Retry
      </button>
    </div>
  );
}
