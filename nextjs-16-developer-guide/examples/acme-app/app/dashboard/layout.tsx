import Link from "next/link";
import React from "react";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "80vh", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
      <aside style={{ width: "240px", borderRight: "1px solid #e2e8f0", padding: "1.5rem", background: "#f8fafc" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem" }}>Dashboard Shell</h3>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
          <Link href="/dashboard" style={{ color: "#2563eb", textDecoration: "none" }}>
            Overview
          </Link>
          <Link href="/dashboard/projects" style={{ color: "#2563eb", textDecoration: "none" }}>
            Projects List
          </Link>
          <Link href="/dashboard/projects/acme-web-portal" style={{ color: "#2563eb", textDecoration: "none" }}>
            Featured Project
          </Link>
        </nav>
      </aside>

      <div style={{ flex: 1, padding: "1.5rem" }}>
        {children}
      </div>
    </div>
  );
}
