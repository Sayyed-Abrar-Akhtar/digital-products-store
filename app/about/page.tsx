import { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/ui/section-header";
import { SITE_CONFIG } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${SITE_CONFIG.name} and our mission to provide engineered digital tools.`,
  alternates: {
    canonical: `${SITE_CONFIG.url}/about`,
  },
};

export default function AboutPage() {
  return (
    <Container className="py-12 sm:py-16 max-w-4xl">
      <SectionHeader
        title={`About ${SITE_CONFIG.name}`}
        subtitle="Dedicated to building high-performance, accessible, and clean digital tools for modern engineers."
        badge="About Us"
      />

      <div className="space-y-8 text-base text-muted-foreground leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">Our Philosophy</h2>
          <p>
            We believe digital products should be built with the highest engineering standards.
            Too many commercial starters and UI kits rely on bloated dependencies, unmaintained packages, or anti-pattern code structures.
          </p>
          <p>
            At {SITE_CONFIG.name}, every resource is designed to be lightweight, fully typed with TypeScript strictness, and completely aligned with Next.js App Router best practices.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">Architectural Commitments</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Next.js 16 Native</strong>: Server-first architecture leveraging modern React 19 primitives.</li>
            <li><strong>Strict Accessibility</strong>: WCAG compliant contrast ratios and keyboard navigation support.</li>
            <li><strong>Zero Unnecessary Dependencies</strong>: Clean, maintainable codebases you can rely on in production.</li>
          </ul>
        </section>
      </div>
    </Container>
  );
}
