import Link from "next/link";
import { fetchProjects } from "@/lib/projects";
import { ProjectStatusToggle } from "./_components/status-toggle";

export default async function ProjectsListPage() {
  const projects = await fetchProjects();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>System Projects</h1>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Active production & staging workloads</p>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
            <th style={{ padding: "8px" }}>Project Name</th>
            <th style={{ padding: "8px" }}>Region</th>
            <th style={{ padding: "8px" }}>Environment</th>
            <th style={{ padding: "8px" }}>Interactive Status</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((proj) => (
            <tr key={proj.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "8px" }}>
                <Link href={`/dashboard/projects/${proj.slug}`} style={{ color: "#2563eb", fontWeight: "600" }}>
                  {proj.name}
                </Link>
              </td>
              <td style={{ padding: "8px", color: "#475569" }}>{proj.region}</td>
              <td style={{ padding: "8px" }}>{proj.environment}</td>
              <td style={{ padding: "8px" }}>
                <ProjectStatusToggle initialStatus={proj.status} projectId={proj.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
