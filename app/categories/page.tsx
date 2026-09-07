import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/ui/section-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CATEGORIES, PRODUCTS } from "@/lib/data/store-data";
import { SITE_CONFIG } from "@/lib/config/site";
import { FolderKanban, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Product Categories",
  description: "Browse digital product categories and engineering resource groupings.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/categories`,
  },
};

export default function CategoriesPage() {
  return (
    <Container className="py-12 sm:py-16">
      <SectionHeader
        title="Product Categories"
        subtitle="Explore our digital asset taxonomy organized by functional domains."
        badge="Taxonomy"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CATEGORIES.map((category) => {
          const productCount = PRODUCTS.filter((p) => p.categorySlug === category.slug).length;

          return (
            <Card key={category.id} className="flex flex-col justify-between p-6">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground">
                  <FolderKanban className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{category.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {category.description}
                </p>
              </div>
              <div className="pt-6 border-t border-card-border mt-6 flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">
                  {productCount} {productCount === 1 ? "product" : "products"} listed
                </span>
                <Button size="sm" variant="outline" asChild className="gap-2">
                  <Link href={`/categories/${category.slug}`}>
                    <span>Browse Category</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </Container>
  );
}
