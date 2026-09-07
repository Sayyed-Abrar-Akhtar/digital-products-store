import { HeroSection } from "@/components/sections/hero-section";
import { FeaturedProductsSection } from "@/components/sections/featured-products-section";
import { CategoriesSection } from "@/components/sections/categories-section";
import { FreeResourcesSection } from "@/components/sections/free-resources-section";
import { WhyChooseUsSection } from "@/components/sections/why-choose-us-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { SITE_CONFIG } from "@/lib/config/site";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_CONFIG.url}/#website`,
        "url": SITE_CONFIG.url,
        "name": SITE_CONFIG.name,
        "description": SITE_CONFIG.description,
        "publisher": {
          "@id": `${SITE_CONFIG.url}/#organization`,
        },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_CONFIG.url}/#organization`,
        "name": SITE_CONFIG.name,
        "url": SITE_CONFIG.url,
        "logo": `${SITE_CONFIG.url}/og-image.png`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <FeaturedProductsSection />
      <CategoriesSection />
      <FreeResourcesSection />
      <WhyChooseUsSection />
      <NewsletterSection />
    </>
  );
}
