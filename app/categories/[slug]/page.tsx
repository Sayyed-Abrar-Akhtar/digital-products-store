import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/db/data-access";
import { SITE_CONFIG } from "@/lib/config/site";
import { formatCurrency } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category Not Found" };

  const canonicalUrl = `${SITE_CONFIG.url}/categories/${category.slug}`;

  return {
    title: `${category.name} Products | ${SITE_CONFIG.name}`,
    description: category.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${category.name} Products`,
      description: category.description,
      url: canonicalUrl,
      type: "website",
    },
  };
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const categoryProducts = await getProductsByCategory(category.slug);

  const categoryCanonicalUrl = `${SITE_CONFIG.url}/categories/${category.slug}`;

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
        "name": "Categories",
        "item": `${SITE_CONFIG.url}/categories`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": category.name,
        "item": categoryCanonicalUrl,
      },
    ],
  };

  return (
    <Container className="py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs font-mono text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/categories" className="hover:text-foreground transition-colors">
          Categories
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground">{category.name}</span>
      </nav>

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
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="secondary">{product.categoryName}</Badge>
                  {product.badge && <Badge variant="accent">{product.badge}</Badge>}
                </div>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>{product.shortDescription}</CardDescription>
              </CardHeader>
              <CardFooter className="flex items-center justify-between pt-4 mt-auto">
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
      ) : (
        <div className="text-center py-12 border border-dashed border-card-border rounded-xl">
          <p className="text-muted-foreground">No products in this category currently.</p>
        </div>
      )}
    </Container>
  );
}
