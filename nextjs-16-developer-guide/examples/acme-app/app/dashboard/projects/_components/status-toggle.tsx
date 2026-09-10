"use client";

import { useState } from "react";

interface StatusBadgeProps {
  initialStatus: "active" | "maintenance" | "archived";
  projectId: string;
}

export function ProjectStatusToggle({ initialStatus, projectId }: StatusBadgeProps) {
  const [status, setStatus] = useState(initialStatus);

  const toggleStatus = () => {
    const nextStatus = status === "active" ? "maintenance" : "active";
    setStatus(nextStatus);
    // In production, an async Server Action or API mutation would be triggered here
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
      <span
        style={{
          padding: "2px 8px",
          borderRadius: "4px",
          fontSize: "0.75rem",
          fontWeight: 600,
          background: status === "active" ? "#e6f4ea" : "#fef7e0",
          color: status === "active" ? "#137333" : "#b06000"
        }}
      >
        {status.toUpperCase()}
      </span>
      <button
        onClick={toggleStatus}
        type="button"
        style={{
          fontSize: "0.75rem",
          padding: "2px 8px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          background: "#fff",
          cursor: "pointer"
        }}
        aria-label={`Toggle status for project ${projectId}`}
      >
        Toggle Mode
      </button>
    </div>
  );
}
