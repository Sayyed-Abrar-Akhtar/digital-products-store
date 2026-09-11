"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type FilterStatus = "ALL" | "ACTIVE" | "MAINTENANCE" | "ARCHIVED";

const STATUSES: FilterStatus[] = ["ALL", "ACTIVE", "MAINTENANCE", "ARCHIVED"];

export function StatusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleFilter = (status: FilterStatus) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "ALL") {
      params.delete("status");
    } else {
      params.set("status", status.toLowerCase());
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center space-x-2 my-4">
      <span className="text-xs font-semibold text-slate-400">Status Filter:</span>
      {STATUSES.map((st) => {
        const current = searchParams.get("status")?.toUpperCase() || "ALL";
        const isActive = current === st;

        return (
          <button
            key={st}
            onClick={() => handleFilter(st)}
            disabled={isPending}
            className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
              isActive
                ? "bg-blue-600 text-white border-blue-500"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {st}
          </button>
        );
      })}
    </div>
  );
}
