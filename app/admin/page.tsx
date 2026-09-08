import React from "react";
import Link from "next/link";
import {
  Package,
  CheckCircle2,
  FileEdit,
  Clock,
  Archive,
  Gift,
  DollarSign,
  Plus,
  ArrowRight,
  ShieldAlert,
  FolderTree,
  Tags,
} from "lucide-react";
import { getAdminProductStats } from "@/lib/admin/data-access";
import { getAdminAuthContext } from "@/lib/admin/auth-guard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getAdminProductStats();
  const authContext = await getAdminAuthContext();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Admin Overview Dashboard
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Real-time catalog metrics and product operations foundation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Product</span>
          </Link>
        </div>
      </div>

      {/* Security Architecture & Auth Banner */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>Security & Authorization Notice</span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          Authentication infrastructure (e.g. NextAuth, Clerk, or JWT sessions) is intentionally pending for the dedicated authentication milestone. The server-side authorization boundary is structured so that production execution without auth will strictly throw an <code className="font-mono text-amber-300 bg-neutral-900 px-1 py-0.5 rounded">AuthorizationError</code>.
        </p>
        <div className="text-[11px] font-mono text-neutral-500 flex items-center gap-4 pt-1">
          <span>Auth Active: {authContext.isAuthenticated ? "Yes (Dev Fallback)" : "No"}</span>
          <span>Role: {authContext.role || "Unauthenticated"}</span>
        </div>
      </div>

      {/* Real Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Products */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Catalog</span>
            <Package className="w-5 h-5 text-neutral-300" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-white font-mono">{stats.total}</p>
            <p className="text-xs text-neutral-500 mt-1">Products in MongoDB</p>
          </div>
        </div>

        {/* Published Products */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Published</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-emerald-400 font-mono">{stats.published}</p>
            <p className="text-xs text-neutral-500 mt-1">Live on Storefront</p>
          </div>
        </div>

        {/* Draft Products */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Drafts</span>
            <FileEdit className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-amber-400 font-mono">{stats.draft}</p>
            <p className="text-xs text-neutral-500 mt-1">Private & Unreleased</p>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Coming Soon</span>
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-blue-400 font-mono">{stats.comingSoon}</p>
            <p className="text-xs text-neutral-500 mt-1">Teaser Announcements</p>
          </div>
        </div>

        {/* Archived */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Archived</span>
            <Archive className="w-5 h-5 text-neutral-500" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-neutral-400 font-mono">{stats.archived}</p>
            <p className="text-xs text-neutral-500 mt-1">Hidden from Listings</p>
          </div>
        </div>

        {/* Free Resources */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Free Items</span>
            <Gift className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-indigo-300 font-mono">{stats.free}</p>
            <p className="text-xs text-neutral-500 mt-1">Price set to $0</p>
          </div>
        </div>

        {/* Paid Products */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-300">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Paid Items</span>
            <DollarSign className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-emerald-300 font-mono">{stats.paid}</p>
            <p className="text-xs text-neutral-500 mt-1">Price &gt; $0</p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Link
          href="/admin/products"
          className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 p-6 rounded-xl group transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-950/60 text-emerald-400 p-3 rounded-lg border border-emerald-800/80">
              <Package className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-neutral-500 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
            Manage Products
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            View full catalog list, filter drafts/archived, edit properties, and update versions.
          </p>
        </Link>

        <Link
          href="/admin/categories"
          className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 p-6 rounded-xl group transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-950/60 text-blue-400 p-3 rounded-lg border border-blue-800/80">
              <FolderTree className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-neutral-500 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
            Manage Categories
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Define software, template, and resource taxonomy categories and SEO descriptions.
          </p>
        </Link>

        <Link
          href="/admin/tags"
          className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 p-6 rounded-xl group transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-950/60 text-purple-400 p-3 rounded-lg border border-purple-800/80">
              <Tags className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-neutral-500 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
            Manage Tags
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Create normalized catalog tags for framework and tech stack filtering.
          </p>
        </Link>
      </div>
    </div>
  );
}
