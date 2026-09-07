import { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Find answers to common questions regarding purchases, downloads, licenses, and technical updates.",
};

const FAQS = [
  {
    q: "What format do digital product purchases arrive in?",
    a: "Digital products are delivered as clean source code archives (ZIP files) or direct access repositories containing full documentation and setup instructions.",
  },
  {
    q: "Are these starters compatible with Next.js 16?",
    a: "Yes. All our products are built specifically for Next.js 16 and React 19 using the App Router architecture.",
  },
  {
    q: "What license is included with purchases?",
    a: "Products include commercial usage rights allowing you to build personal and client projects without recurring royalties.",
  },
  {
    q: "How do I receive product updates?",
    a: "Product updates are made available to purchasers automatically whenever major framework releases or security updates occur.",
  },
];

export default function FAQPage() {
  return (
    <Container className="py-12 sm:py-16 max-w-4xl">
      <SectionHeader
        title="Frequently Asked Questions"
        subtitle="Answers to common questions about licensing, updates, and technical compatibility."
        badge="Help & FAQ"
      />

      <div className="space-y-4">
        {FAQS.map((faq, idx) => (
          <Card key={idx} className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-2">{faq.q}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
          </Card>
        ))}
      </div>
    </Container>
  );
}
