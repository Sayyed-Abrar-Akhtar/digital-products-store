import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/product-card";
import { getFeaturedProducts } from "@/lib/db/data-access";
import { ArrowRight } from "lucide-react";

export async function FeaturedProductsSection() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <section className="py-16 sm:py-24 border-b border-card-border">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <SectionHeader
            title="Featured Products & Architecture Kits"
            subtitle="Carefully engineered templates, tools, and guides currently in active development."
            badge="Store Highlights"
            className="mb-0"
          />
          <Button variant="ghost" asChild className="gap-2 self-start sm:self-auto">
            <Link href="/products">
              <span>View Full Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
