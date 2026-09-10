import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchProjectBySlug } from "@/lib/projects";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProjectDetailPage({ params, searchParams }: PageProps) {
  // Await asynchronous params and searchParams per Next.js 16 requirements
  const { slug } = await params;
  const search = await searchParams;
  const tab = (typeof search.tab === "string" ? search.tab : "overview");

  const project = await fetchProjectBySlug(slug);
  if (!project) {
    notFound();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{project.name}</h1>
        <Link href="/dashboard/projects" style={{ color: "#2563eb", fontSize: "0.85rem" }}>
          &larr; Back to List
        </Link>
      </div>

      <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem" }}>
        <Link
          href={`/dashboard/projects/${slug}?tab=overview`}
          style={{ fontWeight: tab === "overview" ? "bold" : "normal", color: "#1e293b", textDecoration: "none" }}
        >
          Overview Tab
        </Link>
        <Link
          href={`/dashboard/projects/${slug}?tab=deploys`}
          style={{ fontWeight: tab === "deploys" ? "bold" : "normal", color: "#1e293b", textDecoration: "none" }}
        >
          Deployments Tab
        </Link>
      </div>

      <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
        <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem" }}>
          <strong>Environment:</strong> {project.environment} | <strong>Region:</strong> {project.region}
        </p>
        {tab === "overview" ? (
          <div>
            <p style={{ fontSize: "0.9rem" }}>Active production workspace tracking real-time server component logs.</p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: "0.9rem" }}>Total deployments recorded: <strong>{project.deployCount}</strong></p>
            <p style={{ fontSize: "0.8rem", color: "#64748b" }}>Last deployment timestamp: {project.lastDeployedAt}</p>
          </div>
        )}
      </div>
    </div>
  );
}
