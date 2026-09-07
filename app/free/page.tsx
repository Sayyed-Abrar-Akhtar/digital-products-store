import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLACEHOLDER_FREE_RESOURCES } from "@/lib/data/placeholders";
import { Download, FileText, Gift } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Resources",
  description: "Download free architectural cheat sheets, accessibility checklists, and developer guides.",
};

export default function FreeResourcesPage() {
  return (
    <Container className="py-12 sm:py-16">
      <SectionHeader
        title="Free Developer & Design Assets"
        subtitle="Open community resources, technical cheat sheets, and checklists available for instant access."
        badge="Free Downloads"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PLACEHOLDER_FREE_RESOURCES.map((resource) => (
          <Card key={resource.id} className="p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{resource.category}</Badge>
                <span className="text-xs font-mono text-muted-foreground">{resource.format}</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">{resource.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{resource.description}</p>
            </div>

            <div className="pt-4 border-t border-card-border flex items-center justify-between">
              <span className="text-xs font-mono text-accent">100% Free Asset</span>
              <Button size="sm" variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                <span>Download Asset [Placeholder]</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}
