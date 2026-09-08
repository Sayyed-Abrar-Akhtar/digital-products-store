import React from "react";
import { FolderTree, Plus } from "lucide-react";
import { getAdminCategories } from "@/lib/admin/data-access";
import { createCategoryAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <FolderTree className="w-6 h-6 text-blue-400" />
          Category Management
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Define product classification categories and SEO title/description defaults.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Category Creation Form */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 h-fit">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" /> Create Category
          </h2>

          <form
            action={async (formData: FormData) => {
              "use server";
              const name = formData.get("name") as string;
              const slug = formData.get("slug") as string;
              const description = formData.get("description") as string;
              const seoTitle = formData.get("seoTitle") as string;
              const seoDescription = formData.get("seoDescription") as string;

              await createCategoryAction({
                name,
                slug,
                description,
                seoTitle,
                seoDescription,
              });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Next.js & React"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1">
                Slug <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="slug"
                required
                placeholder="e.g. nextjs-react"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={2}
                placeholder="Category summary..."
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1">
                SEO Title
              </label>
              <input
                type="text"
                name="seoTitle"
                placeholder="Target SEO Title"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1">
                SEO Description
              </label>
              <textarea
                name="seoDescription"
                rows={2}
                placeholder="Target SEO Description"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm py-2 rounded-lg transition-colors"
            >
              Add Category
            </button>
          </form>
        </div>

        {/* Existing Categories Table */}
        <div className="md:col-span-2 bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800 font-bold text-white text-sm">
            Database Categories ({categories.length})
          </div>
          <div className="divide-y divide-neutral-800">
            {categories.map((cat) => (
              <div key={cat.id} className="p-4 hover:bg-neutral-900/50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{cat.name}</span>
                  <span className="font-mono text-xs text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                    {cat.slug}
                  </span>
                </div>
                {cat.description && (
                  <p className="text-xs text-neutral-400 mt-1">{cat.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
