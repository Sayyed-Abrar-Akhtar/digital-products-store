import { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/ui/section-header";
import { SITE_CONFIG } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of service and software licensing conditions for ${SITE_CONFIG.name}.`,
  alternates: {
    canonical: `${SITE_CONFIG.url}/terms`,
  },
};

export default function TermsOfServicePage() {
  return (
    <Container className="py-12 sm:py-16 max-w-4xl">
      <SectionHeader
        title="Terms of Service"
        subtitle="General rules, licensing terms, and platform conditions."
        badge="Legal & Draft Terms"
      />

      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-600 dark:text-amber-400 mb-8">
        NOTICE: This document is a foundational draft template for {SITE_CONFIG.name}. Official terms will be finalized prior to commercial transactions.
      </div>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or browsing {SITE_CONFIG.name}, you agree to comply with these terms. If you do not agree with any part of these terms, please discontinue use of the platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">2. Digital Product Licensing</h2>
          <p>
            All upcoming starter kits, templates, and design systems available on {SITE_CONFIG.name} are licensed for single developer or commercial usage according to the product purchase license terms. Redistribution or un-authorized re-selling of raw source code is prohibited.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">3. Intellectual Property</h2>
          <p>
            All branding, visual designs, source code architecture, and educational documentation remain the intellectual property of {SITE_CONFIG.author.name} unless explicitly licensed otherwise.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">4. Limitation of Liability</h2>
          <p>
            Digital products and free resources are provided &quot;as-is&quot; without warranty of any kind. {SITE_CONFIG.name} shall not be liable for any indirect damages resulting from software integration.
          </p>
        </section>
      </div>
    </Container>
  );
}
