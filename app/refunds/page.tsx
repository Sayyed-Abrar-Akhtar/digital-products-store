import { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/ui/section-header";
import { SITE_CONFIG } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: `Refund policy for digital products offered by ${SITE_CONFIG.name}.`,
  alternates: {
    canonical: `${SITE_CONFIG.url}/refunds`,
  },
};

export default function RefundPolicyPage() {
  return (
    <Container className="py-12 sm:py-16 max-w-4xl">
      <SectionHeader
        title="Refund Policy"
        subtitle="Policy guidelines regarding digital asset returns and refunds."
        badge="Legal & Draft Policy"
      />

      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-600 dark:text-amber-400 mb-8">
        NOTICE: This document is a foundational draft template for {SITE_CONFIG.name}. Official refund terms will be activated upon launch of paid digital checkout.
      </div>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">1. Digital Nature of Products</h2>
          <p>
            Due to the non-returnable nature of downloadable software products, starter kits, and source code, refunds are evaluated on a case-by-case basis.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">2. Refund Eligibility Criteria</h2>
          <p>
            Refunds will be granted if:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The digital file is proven corrupt or missing critical core files upon download.</li>
            <li>The product was purchased accidentally and download logs confirm no asset download occurred.</li>
            <li>Technical support is unable to resolve a critical flaw in the core template code within 14 days of purchase.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">3. How to Request a Refund</h2>
          <p>
            To submit a refund inquiry, contact support@sayyedabrarakhtar.com.np with your purchase order ID and details of the technical issue.
          </p>
        </section>
      </div>
    </Container>
  );
}
