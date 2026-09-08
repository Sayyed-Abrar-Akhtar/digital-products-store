"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect, useTransition } from "react";
import { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, SlidersHorizontal, ArrowUpDown, FilterX, Loader2 } from "lucide-react";

interface CatalogControlsProps {
  categories: Category[];
  totalProducts: number;
}

const PRODUCT_TYPES = [
  { value: "template", label: "Templates" },
  { value: "software", label: "Software & Boilerplates" },
  { value: "tool", label: "Developer Tools" },
  { value: "resource", label: "Guides & Resources" },
  { value: "ebook", label: "E-Books" },
  { value: "course", label: "Courses" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest Releases" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "featured", label: "Featured First" },
];

export function CatalogControls({ categories, totalProducts }: CatalogControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentType = searchParams.get("type") || "";
  const currentFree = searchParams.get("free") === "true";
  const currentSort = searchParams.get("sort") || "newest";

  const [searchTerm, setSearchTerm] = useState(currentQ);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setSearchTerm(currentQ);
  }, [currentQ]);

  const updateQueryParams = useCallback(
    (updates: Record<string, string | boolean | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === false) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams({ q: searchTerm.trim() });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    updateQueryParams({ q: null });
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const hasActiveFilters = Boolean(
    currentQ || currentCategory || currentType || currentFree || currentSort !== "newest"
  );

  return (
    <div className="space-y-6 mb-8">
      {/* Search Bar & Mobile Trigger Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products by name, tag, or technology..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-20 h-11 bg-card border-card-border focus:border-accent text-sm"
            aria-label="Search catalog products"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <Button
            type="submit"
            size="sm"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3 text-xs"
            disabled={isPending}
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search"}
          </Button>
        </form>

        <div className="flex items-center gap-2 shrink-0 justify-between sm:justify-start">
          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            className="sm:hidden h-11 gap-2 flex-1"
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            aria-expanded={isMobileFiltersOpen}
            aria-label="Toggle filters menu"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-accent" />}
          </Button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 h-11 px-3 rounded-lg border border-card-border bg-card text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <label htmlFor="sort-select" className="sr-only">
              Sort catalog by
            </label>
            <select
              id="sort-select"
              value={currentSort}
              onChange={(e) => updateQueryParams({ sort: e.target.value })}
              className="bg-transparent font-medium focus:outline-none text-foreground cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-card text-foreground">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Filter Bar / Mobile Expandable Drawer */}
      <div className={`space-y-4 sm:block ${isMobileFiltersOpen ? "block" : "hidden sm:block"}`}>
        <div className="p-4 rounded-xl border border-card-border bg-card/60 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground pb-2 border-b border-card-border">
            <span className="font-semibold text-foreground uppercase tracking-wider">Categories:</span>
            <button
              onClick={() => updateQueryParams({ category: null })}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                !currentCategory
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "bg-muted/40 hover:bg-muted text-muted-foreground"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateQueryParams({ category: cat.slug })}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  currentCategory === cat.slug
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            {/* Types and Free Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-foreground uppercase tracking-wider">Type:</span>
              <button
                onClick={() => updateQueryParams({ type: null })}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  !currentType
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground"
                }`}
              >
                All
              </button>
              {PRODUCT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => updateQueryParams({ type: type.value })}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    currentType === type.value
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {type.label}
                </button>
              ))}

              <span className="text-muted-foreground/40 mx-1">|</span>

              <button
                onClick={() => updateQueryParams({ free: currentFree ? null : "true" })}
                className={`px-2.5 py-1 rounded-md transition-colors border ${
                  currentFree
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 font-semibold"
                    : "border-card-border bg-muted/40 hover:bg-muted text-muted-foreground"
                }`}
              >
                {currentFree ? "✓ Free Only" : "Free Resources"}
              </button>
            </div>

            {/* Clear All CTA */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAllFilters}
                className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Status Header: Count and active filter chips */}
      <div className="flex items-center justify-between text-xs text-muted-foreground font-mono pt-1">
        <div>
          Showing <span className="font-bold text-foreground">{totalProducts}</span> {totalProducts === 1 ? "product" : "products"}
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-muted-foreground">Active:</span>
            {currentQ && (
              <Badge variant="outline" className="text-[10px] gap-1">
                Query: "{currentQ}"
                <X className="w-3 h-3 cursor-pointer" onClick={handleClearSearch} />
              </Badge>
            )}
            {currentCategory && (
              <Badge variant="outline" className="text-[10px] gap-1">
                Cat: {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateQueryParams({ category: null })} />
              </Badge>
            )}
            {currentType && (
              <Badge variant="outline" className="text-[10px] gap-1">
                Type: {PRODUCT_TYPES.find((t) => t.value === currentType)?.label || currentType}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateQueryParams({ type: null })} />
              </Badge>
            )}
            {currentFree && (
              <Badge variant="outline" className="text-[10px] gap-1 text-emerald-600 dark:text-emerald-400">
                Free Only
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateQueryParams({ free: null })} />
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
