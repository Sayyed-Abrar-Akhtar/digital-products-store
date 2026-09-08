import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tags,
  ExternalLink,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";
import { getAdminAuthContext } from "@/lib/admin/auth-guard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authContext = await getAdminAuthContext();

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col font-sans antialiased">
      {/* Top Warning Banner if Auth is Pending */}
      {authContext.warningMessage && (
        <div className="bg-amber-950/80 border-b border-amber-800/60 px-4 py-2.5 text-xs sm:text-sm text-amber-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 max-w-5xl mx-auto">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-medium">{authContext.warningMessage}</span>
          </div>
        </div>
      )}

      {/* Admin Main Header */}
      <header className="bg-neutral-950 border-b border-neutral-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-lg font-bold text-white tracking-tight hover:opacity-90 transition-opacity"
            >
              <Image
                src="/logo-transparent.png"
                alt="Store Logo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
              <span>Store Admin</span>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-semibold uppercase px-2 py-0.5 rounded ml-1">
                Internal
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link
                href="/admin"
                className="px-3 py-2 rounded-md text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/admin/products"
                className="px-3 py-2 rounded-md text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Products
              </Link>
              <Link
                href="/admin/categories"
                className="px-3 py-2 rounded-md text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors flex items-center gap-2"
              >
                <FolderTree className="w-4 h-4" />
                Categories
              </Link>
              <Link
                href="/admin/tags"
                className="px-3 py-2 rounded-md text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors flex items-center gap-2"
              >
                <Tags className="w-4 h-4" />
                Tags
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/products"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm font-medium text-neutral-400 hover:text-white flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg hover:border-neutral-700 transition-colors"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-800 py-4 px-4 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Store Admin Management — Internal Console</p>
          <p className="font-mono text-[11px] text-neutral-600">
            Auth Status: {authContext.isAuthenticated ? "Active (Dev Mode)" : "Disabled (Pending Auth)"}
          </p>
        </div>
      </footer>
    </div>
  );
}
