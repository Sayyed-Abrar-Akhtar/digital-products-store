import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getProductBySlug, getRelatedProducts } from "@/lib/db/data-access";
import { ProductCard } from "@/components/ui/product-card";
import { SITE_CONFIG } from "@/lib/config/site";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Check, Shield, ChevronRight, Terminal, Layers } from "lucide-react";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  const canonicalUrl = `${SITE_CONFIG.url}/products/${product.slug}`;
  const title = product.seoTitle || `${product.name} | ${SITE_CONFIG.name}`;
  const description = product.seoDescription || product.shortDescription;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: product.name,
      description,
      url: canonicalUrl,
      type: "website",
      images: product.images.length > 0 ? product.images : [SITE_CONFIG.ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.images.length > 0 ? [product.images[0]] : [SITE_CONFIG.ogImage],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product, 3);

  const productCanonicalUrl = `${SITE_CONFIG.url}/products/${product.slug}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": SITE_CONFIG.url,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Products",
        "item": `${SITE_CONFIG.url}/products`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": productCanonicalUrl,
      },
    ],
  };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.shortDescription,
    "category": product.categoryName,
    "image": product.images.length > 0 ? product.images : [SITE_CONFIG.ogImage],
    "offers": {
      "@type": "Offer",
      "priceCurrency": product.currency,
      "price": product.price,
      "availability": product.status === "published"
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
      "url": productCanonicalUrl,
    },
  };

  return (
    <Container className="py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      {/* Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs font-mono text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-foreground transition-colors">
          Products
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground truncate max-w-[200px] sm:max-w-none">{product.name}</span>
      </nav>

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
              {product.shortDescription}
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none border-t border-card-border pt-6">
            <h2 className="text-xl font-bold mb-3 text-foreground">Product Overview</h2>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          <div className="border-t border-card-border pt-6">
            <h2 className="text-xl font-bold mb-4 text-foreground">Key Features & Architecture</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-card border border-card-border">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {product.requirements && product.requirements.length > 0 && (
            <div className="border-t border-card-border pt-6">
              <h2 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
                <Terminal className="w-5 h-5 text-accent" />
                <span>Technical Requirements</span>
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                {product.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="border-t border-card-border pt-8 space-y-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Layers className="w-5 h-5 text-accent" />
                <span>Related Products</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProducts.map((rel) => (
                  <ProductCard key={rel.id} product={rel} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 p-6 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono text-muted-foreground uppercase">Target Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-foreground">
                  {formatCurrency(product.price, product.currency)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm text-muted-foreground line-through font-mono">
                    {formatCurrency(product.compareAtPrice, product.currency)}
                  </span>
                )}
              </div>
            </div>

            <Button size="lg" className="w-full gap-2" disabled>
              In Development — Registration Opening Soon
            </Button>
            <p className="text-xs text-center text-muted-foreground leading-normal">
              This digital product is currently in active development. Checkout will activate upon version 1.0 release.
            </p>

            <div className="border-t border-card-border pt-4 space-y-3 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-accent" /> Status:
                </span>
                <span className="font-mono font-semibold text-foreground capitalize">
                  {product.status.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Version Target:</span>
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
