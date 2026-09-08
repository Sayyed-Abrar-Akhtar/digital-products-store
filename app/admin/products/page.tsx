import React from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  ExternalLink,
  Archive,
  CheckCircle2,
  FileEdit,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getAdminProducts } from "@/lib/admin/data-access";
import { archiveProductAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

interface SearchParamsProps {
  searchParams?: Promise<{
    status?: string;
    type?: string;
    free?: string;
    q?: string;
    page?: string;
  }>;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "published":
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
          <CheckCircle2 className="w-3 h-3" /> Published
        </span>
      );
    case "draft":
      return (
        <span className="inline-flex items-center gap-1 bg-amber-950/80 text-amber-400 border border-amber-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
          <FileEdit className="w-3 h-3" /> Draft
        </span>
      );
    case "coming_soon":
      return (
        <span className="inline-flex items-center gap-1 bg-blue-950/80 text-blue-400 border border-blue-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
          <Clock className="w-3 h-3" /> Coming Soon
        </span>
      );
    case "archived":
      return (
        <span className="inline-flex items-center gap-1 bg-neutral-900 text-neutral-400 border border-neutral-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
          <Archive className="w-3 h-3" /> Archived
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
          {status}
        </span>
      );
  }
}

export default async function AdminProductsPage({ searchParams }: SearchParamsProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const status = resolvedParams.status || "all";
  const type = resolvedParams.type || "all";
  const search = resolvedParams.q || "";
  const page = parseInt(resolvedParams.page || "1", 10);

  const { products, pagination } = await getAdminProducts({
    status,
    type,
    search,
    page,
    limit: 15,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Product Catalog Management</h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Browse, search, edit, and manage status transitions for all products.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <form method="GET" className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
          <input
            type="text"
            name="q"
            defaultValue={search}
            placeholder="Search by product name or slug..."
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            name="status"
            defaultValue={status}
            className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="coming_soon">Coming Soon</option>
            <option value="archived">Archived</option>
          </select>

          <select
            name="type"
            defaultValue={type}
            className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Types</option>
            <option value="software">Software</option>
            <option value="template">Template</option>
            <option value="resource">Resource</option>
            <option value="tool">Developer Tool</option>
          </select>

          <button
            type="submit"
            className="bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium px-4 py-2 rounded-lg border border-neutral-700 transition-colors flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
        </div>
      </form>

      {/* Product Table */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-900 border-b border-neutral-800 text-xs font-semibold uppercase text-neutral-400">
              <tr>
                <th className="px-5 py-3.5">Product Name & Slug</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Price</th>
                <th className="px-4 py-3.5">Version</th>
                <th className="px-4 py-3.5">Updated</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-neutral-500 text-sm">
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="font-mono text-xs text-neutral-500">{item.slug}</div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-4 capitalize text-xs text-neutral-400">
                      {item.productType}
                    </td>
                    <td className="px-4 py-4 text-xs text-neutral-300">
                      {item.categoryName}
                    </td>
                    <td className="px-4 py-4 font-mono font-medium text-white">
                      {item.isFree || item.price === 0 ? (
                        <span className="text-emerald-400">FREE</span>
                      ) : (
                        `$${item.price}`
                      )}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-neutral-400">
                      v{item.version}
                    </td>
                    <td className="px-4 py-4 text-xs text-neutral-500">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${item.id}`}
                          className="p-1.5 text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded border border-neutral-700 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>

                        {item.status === "published" && (
                          <a
                            href={`/products/${item.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded border border-neutral-700 transition-colors"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {item.status !== "archived" && (
                          <form
                            action={async () => {
                              "use server";
                              await archiveProductAction(item.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="p-1.5 text-red-400 hover:text-red-300 bg-neutral-900 hover:bg-neutral-800 rounded border border-neutral-800 transition-colors"
                              title="Archive Product"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="bg-neutral-900 border-t border-neutral-800 px-5 py-3 flex items-center justify-between text-xs text-neutral-400">
            <div>
              Showing Page <span className="text-white font-mono">{pagination.page}</span> of{" "}
              <span className="text-white font-mono">{pagination.totalPages}</span> ({pagination.total} total items)
            </div>

            <div className="flex items-center gap-2">
              {pagination.page > 1 && (
                <Link
                  href={`/admin/products?status=${status}&type=${type}&q=${search}&page=${pagination.page - 1}`}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center gap-1 border border-neutral-700"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </Link>
              )}
              {pagination.page < pagination.totalPages && (
                <Link
                  href={`/admin/products?status=${status}&type=${type}&q=${search}&page=${pagination.page + 1}`}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center gap-1 border border-neutral-700"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
