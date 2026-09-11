import Link from "next/link";
import { fetchProjects, fetchSystemMetrics } from "@/lib/projects";
import { StatusFilter } from "./_components/status-filter";
import { CreateProjectForm } from "./_components/create-project-form";

interface PageProps {
  searchParams?: Promise<{ status?: string }>;
}

export default async function DashboardOverviewPage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const statusFilter = resolvedParams.status?.toLowerCase();

  const [allProjects, metrics] = await Promise.all([
    fetchProjects(),
    fetchSystemMetrics(),
  ]);

  const projects = statusFilter
    ? allProjects.filter((p) => p.status.toLowerCase() === statusFilter)
    : allProjects;

  return (
    <div className="space-y-8 text-white">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Acme Executive Dashboard</h1>
        <p className="text-sm text-slate-400">
          Server Component streaming telemetry and active deployment directory.
        </p>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div key={m.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-xs font-semibold text-slate-400">{m.label}</span>
            <p className="text-2xl font-bold font-mono">
              {m.unit === "USD" ? `$${m.value.toLocaleString()}` : m.value.toLocaleString()}
            </p>
            <span
              className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                m.status === "healthy"
                  ? "bg-green-950 text-green-300 border border-green-800"
                  : "bg-yellow-950 text-yellow-300 border border-yellow-800"
              }`}
            >
              {m.status}
            </span>
          </div>
        ))}
      </div>

      {/* Projects Directory & Interactive Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 border-t border-slate-800">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <h2 className="text-xl font-bold">System Projects</h2>
            <StatusFilter />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <div
                key={p.id}
                className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded uppercase">
                      {p.environment}
                    </span>
                    <span className="text-xs font-semibold uppercase text-slate-400">{p.status}</span>
                  </div>
                  <h3 className="font-bold text-lg">{p.name}</h3>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">{p.region}</span>
                  <Link
                    href={`/dashboard/projects/${p.slug}`}
                    className="font-semibold text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    Details &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <CreateProjectForm />
        </div>
      </div>
    </div>
  );
}
