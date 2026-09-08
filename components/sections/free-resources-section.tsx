import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLACEHOLDER_FREE_RESOURCES } from "@/lib/data/placeholders";
import { Download, FileText } from "lucide-react";

export function FreeResourcesSection() {
  return (
    <section className="py-16 sm:py-24 border-b border-card-border">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <SectionHeader
            title="Free Architectural Resources"
            subtitle="Open learning resources, cheat sheets, and checklists to help you build better web apps."
            badge="Free Downloads"
            className="mb-0"
          />
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button variant="outline" size="sm" asChild>
              <Link href="/products?free=true">Filter Catalog (Free Only)</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/free">View All Free Assets</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLACEHOLDER_FREE_RESOURCES.map((resource) => (
            <Card key={resource.id} className="flex flex-col sm:flex-row items-start justify-between p-6 gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{resource.category}</Badge>
                  <span className="text-xs font-mono text-muted-foreground">{resource.format}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground">{resource.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{resource.description}</p>
              </div>
              <Button variant="outline" size="sm" asChild className="shrink-0 gap-2 w-full sm:w-auto">
                <Link href="/free">
                  <Download className="w-4 h-4" />
                  <span>Download Free</span>
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
