import Link from "next/link";
import { fetchSystemMetrics } from "@/lib/projects";

export default async function DashboardOverviewPage() {
  const metrics = await fetchSystemMetrics();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Dashboard Overview</h1>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Server Component streaming telemetry summary.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        {metrics.map((m) => (
          <div key={m.id} style={{ border: "1px solid #cbd5e1", padding: "1rem", borderRadius: "6px" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{m.label}</span>
            <p style={{ fontSize: "1.4rem", fontWeight: "bold", margin: "0.25rem 0" }}>
              {m.unit === "USD" ? `$${m.value.toLocaleString()}` : m.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "1rem" }}>
        <Link href="/dashboard/projects" style={{ color: "#2563eb", fontWeight: "500" }}>
          View All Projects &rarr;
        </Link>
      </div>
    </div>
  );
}
