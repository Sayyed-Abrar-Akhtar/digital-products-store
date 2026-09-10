import "server-only";

export interface SystemProject {
  id: string;
  name: string;
  slug: string;
  environment: "production" | "staging" | "development";
  region: string;
  status: "active" | "maintenance" | "archived";
  deployCount: number;
  lastDeployedAt: string;
}

export interface SystemMetric {
  id: string;
  key: string;
  label: string;
  value: number;
  unit: string;
  status: "healthy" | "degraded" | "critical";
}

export async function fetchProjects(): Promise<SystemProject[]> {
  // Simulating secure database access on Next.js 16 Server Runtime.
  return [
    {
      id: "proj-101",
      name: "Acme Web Portal",
      slug: "acme-web-portal",
      environment: "production",
      region: "us-east-1",
      status: "active",
      deployCount: 342,
      lastDeployedAt: "2026-03-28T14:22:00Z"
    },
    {
      id: "proj-102",
      name: "Billing & Subscriptions API",
      slug: "billing-api",
      environment: "production",
      region: "us-west-2",
      status: "active",
      deployCount: 189,
      lastDeployedAt: "2026-03-29T09:15:00Z"
    },
    {
      id: "proj-103",
      name: "Analytics Ingestion Pipeline",
      slug: "analytics-pipeline",
      environment: "staging",
      region: "eu-central-1",
      status: "maintenance",
      deployCount: 76,
      lastDeployedAt: "2026-03-27T18:40:00Z"
    }
  ];
}

export async function fetchProjectBySlug(slug: string): Promise<SystemProject | null> {
  const projects = await fetchProjects();
  return projects.find((p) => p.slug === slug) || null;
}

export async function fetchSystemMetrics(): Promise<SystemMetric[]> {
  return [
    { id: "m-101", key: "active_orgs", label: "Active Organizations", value: 1248, unit: "count", status: "healthy" },
    { id: "m-102", key: "mrr_usd", label: "Monthly Recurring Revenue", value: 42500, unit: "USD", status: "healthy" },
    { id: "m-103", key: "api_latency_p99", label: "P99 API Latency", value: 42.8, unit: "ms", status: "healthy" }
  ];
}
