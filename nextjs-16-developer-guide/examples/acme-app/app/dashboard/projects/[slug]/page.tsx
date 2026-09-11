import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchProjectBySlug } from "@/lib/projects";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${project.name} (${project.slug}) | Acme Developer Guide`,
    description: `Production telemetry and status detail for ${project.name} deployed in ${project.region}.`,
    openGraph: {
      title: `${project.name} Telemetry`,
      description: `Active deployment status: ${project.status}`,
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await fetchProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="p-8 max-w-3xl mx-auto space-y-6 text-white">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-mono px-2 py-0.5 bg-blue-950 text-blue-300 rounded border border-blue-800 uppercase">
            {project.environment}
          </span>
          <h1 className="text-3xl font-bold mt-2">{project.name}</h1>
        </div>
        <Link
          href="/dashboard"
          className="text-xs font-medium px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <p className="text-xs text-slate-400">Region</p>
          <p className="text-lg font-bold font-mono">{project.region}</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <p className="text-xs text-slate-400">Status</p>
          <p className="text-lg font-bold uppercase">{project.status}</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <p className="text-xs text-slate-400">Deploy Count</p>
          <p className="text-lg font-bold">{project.deployCount}</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <p className="text-xs text-slate-400">Last Deployed</p>
          <p className="text-sm font-mono mt-1">{project.lastDeployedAt.slice(0, 10)}</p>
        </div>
      </div>
    </main>
  );
}
