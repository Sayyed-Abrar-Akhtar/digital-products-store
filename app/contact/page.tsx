import { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/ui/section-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/config/site";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact & Support",
  description: "Get in touch for custom architecture support or product inquiries.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/contact`,
  },
};

export default function ContactPage() {
  return (
    <Container className="py-12 sm:py-16 max-w-4xl">
      <SectionHeader
        title="Contact & Support"
        subtitle="Have questions about our upcoming digital products or custom architecture services? Get in touch."
        badge="Get in Touch"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-6 md:col-span-1 space-y-4 h-fit">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Mail className="w-5 h-5 text-accent" />
            <span>Direct Email</span>
          </div>
          <p className="text-sm text-muted-foreground">
            For support or general inquiries, email us directly at:
          </p>
          <div className="text-xs font-mono text-accent truncate">
            support@sayyedabrarakhtar.com.np
          </div>
        </Card>

        <Card className="p-6 md:col-span-2 space-y-6">
          <form action="#" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-foreground">Name</label>
                <Input placeholder="Your Name" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-foreground">Email</label>
                <Input type="email" placeholder="you@example.com" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-foreground">Subject</label>
              <Input placeholder="Inquiry subject" required />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-foreground">Message</label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-card-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="How can we help you?"
                required
              />
            </div>

            <Button type="submit" className="w-full sm:w-auto">
              Send Message
            </Button>
          </form>
        </Card>
      </div>
    </Container>
  );
}
