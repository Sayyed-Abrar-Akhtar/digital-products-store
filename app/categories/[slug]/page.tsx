import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLACEHOLDER_CATEGORIES, PLACEHOLDER_PRODUCTS } from "@/lib/data/placeholders";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = PLACEHOLDER_CATEGORIES.find((c) => c.slug === slug);
  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} Products`,
    description: category.description,
  };
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { slug } = await params;
  const category = PLACEHOLDER_CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const categoryProducts = PLACEHOLDER_PRODUCTS.filter((p) => p.categorySlug === category.slug);

  return (
    <Container className="py-12 sm:py-16">
      <Link
        href="/categories"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Categories</span>
      </Link>

      <SectionHeader
        title={category.name}
        subtitle={category.description}
        badge="Category"
      />

      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryProducts.map((product) => (
            <Card key={product.id} className="flex flex-col h-full">
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>{product.tagline}</CardDescription>
              </CardHeader>
              <CardFooter className="flex items-center justify-between pt-4 mt-auto">
                <span className="text-xl font-bold font-mono">
                  {formatCurrency(product.price)}
                </span>
                <Button size="sm" asChild>
                  <Link href={`/products/${product.slug}`}>View Product</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-card-border rounded-xl">
          <p className="text-muted-foreground">No placeholder products in this category currently.</p>
        </div>
      )}
    </Container>
  );
}
