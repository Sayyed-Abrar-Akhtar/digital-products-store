import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLACEHOLDER_PRODUCTS } from "@/lib/data/placeholders";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, Tag } from "lucide-react";

export function FeaturedProductsSection() {
  return (
    <section className="py-16 sm:py-24 border-b border-card-border">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <SectionHeader
            title="Featured Digital Products"
            subtitle="Carefully engineered templates, tools, and guides ready for production deployment."
            badge="Store Highlights"
            className="mb-0"
          />
          <Button variant="ghost" asChild className="gap-2 self-start sm:self-auto">
            <Link href="/products">
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLACEHOLDER_PRODUCTS.slice(0, 3).map((product) => (
            <Card key={product.id} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="secondary">{product.categoryName}</Badge>
                  {product.badge && <Badge variant="accent">{product.badge}</Badge>}
                </div>
                <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                <CardDescription className="line-clamp-2">{product.tagline}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {product.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-accent" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between pt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono">
                    {formatCurrency(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through font-mono">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/products/${product.slug}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
