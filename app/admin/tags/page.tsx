import React from "react";
import { Tags, Plus } from "lucide-react";
import { getAdminTags } from "@/lib/admin/data-access";
import { createTagAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const tags = await getAdminTags();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Tags className="w-6 h-6 text-purple-400" />
          Tag Management
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Create and view normalized product tags for technical filtering.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Tag Creation Form */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 h-fit">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" /> Create Tag
          </h2>

          <form
            action={async (formData: FormData) => {
              "use server";
              const name = formData.get("name") as string;
              const slug = formData.get("slug") as string;
              const description = formData.get("description") as string;

              await createTagAction({
                name,
                slug,
                description,
              });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1">
                Tag Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Next.js"
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
                placeholder="e.g. nextjs"
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
                placeholder="Optional description"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm py-2 rounded-lg transition-colors"
            >
              Add Tag
            </button>
          </form>
        </div>

        {/* Existing Tags Table */}
        <div className="md:col-span-2 bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800 font-bold text-white text-sm">
            Database Tags ({tags.length})
          </div>
          {tags.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-sm">
              No tags found in database. Create your first tag on the left.
            </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {tags.map((tag) => (
                <div key={tag.id} className="p-4 flex items-center justify-between hover:bg-neutral-900/50 transition-colors">
                  <div>
                    <span className="font-semibold text-white text-sm">{tag.name}</span>
                    {tag.description && (
                      <p className="text-xs text-neutral-400 mt-0.5">{tag.description}</p>
                    )}
                  </div>
                  <span className="font-mono text-xs text-purple-300 bg-purple-950/60 border border-purple-800/80 px-2 py-0.5 rounded">
                    {tag.slug}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
