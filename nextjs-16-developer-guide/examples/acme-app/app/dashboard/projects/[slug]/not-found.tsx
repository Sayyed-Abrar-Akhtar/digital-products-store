import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <div className="p-12 text-center space-y-4 text-white">
      <h2 className="text-3xl font-bold text-red-400">Project Not Found</h2>
      <p className="text-slate-400 text-sm">
        The requested project slug does not exist or has been removed.
      </p>
      <Link
        href="/dashboard"
        className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
