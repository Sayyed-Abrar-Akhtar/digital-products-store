import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PLACEHOLDER_PRODUCTS } from "@/lib/data/placeholders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Check, Download, Shield, FileCode, ArrowLeft } from "lucide-react";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = PLACEHOLDER_PRODUCTS.find((p) => p.slug === slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.tagline,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = PLACEHOLDER_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return (
    <Container className="py-12 sm:py-16">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Products</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">{product.categoryName}</Badge>
              {product.badge && <Badge variant="accent">{product.badge}</Badge>}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
              {product.name}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {product.tagline}
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none border-t border-card-border pt-6">
            <h3 className="text-xl font-bold mb-3">Product Overview</h3>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          <div className="border-t border-card-border pt-6">
            <h3 className="text-xl font-bold mb-4">Key Features & Architecture</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-card border border-card-border">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 p-6 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono text-muted-foreground uppercase">Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-foreground">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through font-mono">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            <Button size="lg" className="w-full gap-2" disabled>
              Purchase Access [Placeholder]
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Payment processing foundation mode. No actual charges.
            </p>

            <div className="border-t border-card-border pt-4 space-y-3 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileCode className="w-4 h-4" /> Format:
                </span>
                <span className="font-mono text-foreground">{product.fileFormat}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Version:</span>
                <span className="font-mono text-foreground">{product.version}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Updated:</span>
                <span className="font-mono text-foreground">{formatDate(product.updatedAt)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
}
