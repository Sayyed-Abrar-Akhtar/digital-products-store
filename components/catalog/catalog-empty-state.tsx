import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchX, FilterX, PackageX } from "lucide-react";

interface CatalogEmptyStateProps {
  type?: "no-results" | "no-products" | "empty-category";
  categoryName?: string;
}

export function CatalogEmptyState({ type = "no-results", categoryName }: CatalogEmptyStateProps) {
  if (type === "empty-category") {
    return (
      <div className="py-16 px-4 text-center border border-dashed border-card-border rounded-2xl bg-card/40 space-y-4 my-8">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
          <PackageX className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">
            No products available in {categoryName || "this category"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            We are currently engineering new digital assets for this category. Check back soon or browse the full catalog.
          </p>
        </div>
        <div className="pt-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/products">Browse All Catalog Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 px-4 text-center border border-dashed border-card-border rounded-2xl bg-card/40 space-y-5 my-8">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
        {type === "no-results" ? <SearchX className="w-6 h-6" /> : <FilterX className="w-6 h-6" />}
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground">
          {type === "no-results" ? "No matching products found" : "No products meet your criteria"}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Try broadening your search term, clearing applied filter tags, or exploring alternative categories.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button asChild variant="default" size="sm">
          <Link href="/products">Reset All Filters</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/categories">Explore Categories</Link>
        </Button>
      </div>
    </div>
  );
}
