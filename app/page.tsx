import { HeroSection } from "@/components/sections/hero-section";
import { FeaturedProductsSection } from "@/components/sections/featured-products-section";
import { CategoriesSection } from "@/components/sections/categories-section";
import { FreeResourcesSection } from "@/components/sections/free-resources-section";
import { WhyChooseUsSection } from "@/components/sections/why-choose-us-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedProductsSection />
      <CategoriesSection />
      <FreeResourcesSection />
      <WhyChooseUsSection />
      <NewsletterSection />
    </>
  );
}
