import { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/ui/section-header";
import { SITE_CONFIG } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy and data handling principles for ${SITE_CONFIG.name}.`,
  alternates: {
    canonical: `${SITE_CONFIG.url}/privacy`,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <Container className="py-12 sm:py-16 max-w-4xl">
      <SectionHeader
        title="Privacy Policy"
        subtitle="Information handling guidelines and privacy principles."
        badge="Legal & Draft Policy"
      />

      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-600 dark:text-amber-400 mb-8">
        NOTICE: This document is a foundational draft template for {SITE_CONFIG.name}. Official legal compliance terms will be published prior to commercial store activation.
      </div>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">1. Data Collection Overview</h2>
          <p>
            At {SITE_CONFIG.name}, we prioritize privacy and data minimization. During our current stage, we do not collect or store user personal data, payment details, or email addresses without explicit consent and backend integration.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">2. Cookies & Local Storage</h2>
          <p>
            Our store uses essential local browser mechanisms exclusively for user interface preferences (such as light or dark theme state). No tracking or third-party advertising cookies are deployed.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">3. Future Commercial Operations</h2>
          <p>
            When paid purchases or user accounts are introduced in future milestones, data collection will strictly cover essential fulfillment metrics handled via secure third-party payment processors.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">4. Contact Information</h2>
          <p>
            For privacy inquiries or technical questions regarding data handling, reach out at support@sayyedabrarakhtar.com.np.
          </p>
        </section>
      </div>
    </Container>
  );
}
