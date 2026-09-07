import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLACEHOLDER_BUNDLES, PLACEHOLDER_PRODUCTS } from "@/lib/data/placeholders";
import { formatCurrency } from "@/lib/utils";
import { Layers, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Product Bundles",
  description: "Curated suites of starter kits, design tokens, and technical playbooks at discounted pricing.",
};

export default function BundlesPage() {
  return (
    <Container className="py-12 sm:py-16">
      <SectionHeader
        title="Curated Product Bundles"
        subtitle="Combine starter kits, design systems, and architecture playbooks for maximum value."
        badge="Bundles & Suites"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {PLACEHOLDER_BUNDLES.map((bundle) => {
          const includedProducts = PLACEHOLDER_PRODUCTS.filter((p) =>
            bundle.includedProductSlugs.includes(p.slug)
          );

          return (
            <Card key={bundle.id} className="p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-accent" />
                    <span className="text-xs font-mono font-semibold uppercase text-accent">Bundle Package</span>
                  </div>
                  {bundle.badge && <Badge variant="accent">{bundle.badge}</Badge>}
                </div>

                <h3 className="text-2xl font-bold text-foreground">{bundle.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{bundle.description}</p>

                <div className="border-t border-card-border pt-4 space-y-2">
                  <span className="text-xs font-mono text-muted-foreground uppercase">Included in this bundle:</span>
                  <div className="space-y-2">
                    {includedProducts.map((prod) => (
                      <div key={prod.id} className="flex items-center justify-between text-sm p-2 rounded bg-muted/40">
                        <span className="font-medium">{prod.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">{formatCurrency(prod.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-card-border pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Total Bundle Value</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono">{formatCurrency(bundle.price)}</span>
                    <span className="text-xs text-muted-foreground line-through font-mono">
                      {formatCurrency(bundle.originalValue)}
                    </span>
                  </div>
                </div>
                <Button disabled className="w-full sm:w-auto">Get Bundle [Placeholder]</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </Container>
  );
}
