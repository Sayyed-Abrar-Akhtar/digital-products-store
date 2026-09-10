import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ padding: "2rem", textAlign: "center", border: "1px dashed #cbd5e1", borderRadius: "8px" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#334155" }}>Project or Resource Not Found</h2>
      <p style={{ color: "#64748b", margin: "0.5rem 0 1.5rem 0" }}>
        The requested system project or route segment could not be located in our records.
      </p>
      <Link href="/dashboard/projects" style={{ color: "#2563eb", fontWeight: "600" }}>
        Return to Projects List
      </Link>
    </div>
  );
}
