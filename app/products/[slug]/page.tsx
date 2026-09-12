import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getProductBySlug, getRelatedProducts } from "@/lib/db/data-access";
import { ProductCard } from "@/components/ui/product-card";
import { SITE_CONFIG } from "@/lib/config/site";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Check, Shield, ChevronRight, Terminal, Layers, FileText, BookOpen, AlertCircle, Sparkles } from "lucide-react";

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
  const isEbook = product.categorySlug === "ebooks" || product.slug === "the-student-study-system";

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
          {/* Header section with optional cover image preview */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {product.images.length > 0 && (
              <div className="relative w-full md:w-48 aspect-[3/4] shrink-0 rounded-lg overflow-hidden border border-card-border bg-card shadow-sm">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{product.categoryName}</Badge>
                {isEbook && <Badge variant="outline" className="gap-1"><FileText className="w-3 h-3" /> PDF Ebook</Badge>}
                {product.badge && <Badge variant="accent">{product.badge}</Badge>}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {product.name}
              </h1>
              <p className="text-lg font-medium text-accent">
                {product.shortDescription}
              </p>
            </div>
          </div>

          {/* Value Proposition & Description */}
          <div className="prose prose-slate dark:prose-invert max-w-none border-t border-card-border pt-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent" />
              <span>Product Summary</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          {/* System Breakdown / Core Features */}
          <div className="border-t border-card-border pt-6">
            <h2 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <span>What Is Included</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-lg bg-card border border-card-border">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Digital Product & Educational Disclaimer */}
          {isEbook && (
            <div className="border-t border-card-border pt-6">
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Educational Productivity Resource Disclosure</span>
                </div>
                <p>
                  This guide is an educational productivity resource designed to teach effective study and retrieval frameworks. It does NOT guarantee specific grades, academic test scores, or exam results.
                </p>
              </div>
            </div>
          )}

          {/* Requirements & Specifications */}
          {product.requirements && product.requirements.length > 0 && (
            <div className="border-t border-card-border pt-6">
              <h2 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
                <Terminal className="w-5 h-5 text-accent" />
                <span>Format & Access Requirements</span>
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

        {/* Commercial Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 p-6 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono text-muted-foreground uppercase">Price</span>
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
              Purchase (Checkout Integration Pending)
            </Button>
            <p className="text-xs text-center text-muted-foreground leading-normal">
              Instant PDF delivery upon purchase verification. Direct checkout integration is currently pending payment provider configuration.
            </p>

            <div className="border-t border-card-border pt-4 space-y-3 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-accent" /> Format:
                </span>
                <span className="font-mono font-semibold text-foreground">PDF Ebook</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Product Status:</span>
                <span className="font-mono font-semibold text-foreground capitalize">
                  {product.status.replace("_", " ")}
                </span>
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
