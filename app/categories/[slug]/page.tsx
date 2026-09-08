import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/ui/section-header";
import { ProductCard } from "@/components/ui/product-card";
import { CatalogEmptyState } from "@/components/catalog/catalog-empty-state";
import { getCategoryBySlug, getProductsByCategory, getPublishedCategories } from "@/lib/db/data-access";
import { SITE_CONFIG } from "@/lib/config/site";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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

      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-6 pb-2 border-b border-card-border">
        <div>
          Showing <span className="font-bold text-foreground">{categoryProducts.length}</span> published {categoryProducts.length === 1 ? "product" : "products"}
        </div>
        <Button variant="ghost" size="sm" asChild className="h-7 text-xs gap-1">
          <Link href="/products">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Catalog Products</span>
          </Link>
        </Button>
      </div>

      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <CatalogEmptyState type="empty-category" categoryName={category.name} />
      )}
    </Container>
  );
}
