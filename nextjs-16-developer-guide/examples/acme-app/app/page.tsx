export interface Metric {
  id: string;
  label: string;
  value: string;
  status: "healthy" | "degraded" | "critical";
}

export async function getDashboardMetrics(): Promise<Metric[]> {
  // Simulating async server data access pattern in Next.js 16 (Target 16.3.4)
  return [
    { id: "m1", label: "Active Organizations", value: "1,248", status: "healthy" },
    { id: "m2", label: "Monthly Recurring Revenue", value: "$42,500", status: "healthy" },
    { id: "m3", label: "P99 API Latency", value: "42.8 ms", status: "healthy" }
  ];
}

export default async function Page() {
  const metrics = await getDashboardMetrics();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Acme SaaS — Next.js 16 Reference Architecture</p>
      </div>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(3, 1fr)", marginTop: "1rem" }}>
        {metrics.map((metric) => (
          <div key={metric.id} style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px", background: "#fdfdfd" }}>
            <span style={{ fontSize: "0.85rem", color: "#666" }}>{metric.label}</span>
            <p style={{ fontSize: "1.75rem", fontWeight: "bold", margin: "0.25rem 0" }}>{metric.value}</p>
            <span style={{ fontSize: "0.75rem", padding: "2px 6px", borderRadius: "4px", background: "#e6f4ea", color: "#137333", fontWeight: "600" }}>
              {metric.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
