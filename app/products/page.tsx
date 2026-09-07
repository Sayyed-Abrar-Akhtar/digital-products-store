import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublishedProducts } from "@/lib/db/data-access";
import { SITE_CONFIG } from "@/lib/config/site";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Digital Products Catalog",
  description: "Browse upcoming starter kits, design systems, and software architecture guides.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/products`,
  },
};

export default async function ProductsPage() {
  const products = await getPublishedProducts();

  return (
    <Container className="py-12 sm:py-16">
      <SectionHeader
        title="All Digital Products"
        subtitle="Catalog of engineered tools, design tokens, templates, and architectural guides."
        badge="Catalog"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="flex flex-col h-full">
            <CardHeader>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant="secondary">{product.categoryName}</Badge>
                {product.badge && <Badge variant="accent">{product.badge}</Badge>}
              </div>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{product.shortDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between pt-4">
              <span className="text-xl font-bold font-mono">
                {formatCurrency(product.price, product.currency)}
              </span>
              <Button size="sm" asChild>
                <Link href={`/products/${product.slug}`}>View Product</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </Container>
  );
}
