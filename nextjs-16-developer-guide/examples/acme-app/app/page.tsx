export interface Metric {
  id: string;
  label: string;
  value: string;
}

export async function getDashboardMetrics(): Promise<Metric[]> {
  // Simulating async server data access pattern in Next.js 16
  return [
    { id: "m1", label: "Active Organizations", value: "1,248" },
    { id: "m2", label: "Monthly Recurring Revenue", value: "$42,500" },
    { id: "m3", label: "API Requests (24h)", value: "3.4M" }
  ];
}

export default async function Page() {
  const metrics = await getDashboardMetrics();

  return (
    <section>
      <h1>Executive Dashboard</h1>
      <p>Welcome to Acme SaaS — Next.js 16 Reference Architecture</p>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(3, 1fr)", marginTop: "1rem" }}>
        {metrics.map((metric) => (
          <div key={metric.id} style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "8px" }}>
            <h3>{metric.label}</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{metric.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
