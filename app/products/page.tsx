import { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/ui/section-header";
import { ProductCard } from "@/components/ui/product-card";
import { CatalogControls } from "@/components/catalog/catalog-controls";
import { CatalogEmptyState } from "@/components/catalog/catalog-empty-state";
import { searchAndFilterProducts, getPublishedCategories, CatalogQueryParams } from "@/lib/db/data-access";
import { SITE_CONFIG } from "@/lib/config/site";

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    type?: string;
    free?: string;
    sort?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const hasFilterParams = Boolean(
    resolvedParams.q || resolvedParams.category || resolvedParams.type || resolvedParams.free || resolvedParams.sort
  );

  const canonicalUrl = `${SITE_CONFIG.url}/products`;

  return {
    title: "Digital Products Catalog — Starter Kits, UI Systems & Tools",
    description: "Browse high-performance Next.js 16 boilerplates, developer design systems, API documentation templates, and architectural guides.",
    alternates: {
      canonical: canonicalUrl,
    },
    robots: hasFilterParams
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const queryParams: CatalogQueryParams = {
    q: resolvedParams.q,
    category: resolvedParams.category,
    type: resolvedParams.type,
    free: resolvedParams.free,
    sort: resolvedParams.sort as any,
  };

  const [products, categories] = await Promise.all([
    searchAndFilterProducts(queryParams),
    getPublishedCategories(),
  ]);

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
    ],
  };

  return (
    <Container className="py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <SectionHeader
        title="Digital Products Catalog"
        subtitle="Engineered Next.js starters, UI design token systems, developer tools, and architectural guides."
        badge="Store Catalog"
      />

      <CatalogControls categories={categories} totalProducts={products.length} />

      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <CatalogEmptyState type="no-results" />
      )}
    </Container>
  );
}
