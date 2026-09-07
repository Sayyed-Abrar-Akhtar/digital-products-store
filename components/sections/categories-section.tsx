import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PLACEHOLDER_CATEGORIES } from "@/lib/data/placeholders";
import { ArrowRight, FolderKanban } from "lucide-react";

export function CategoriesSection() {
  return (
    <section className="py-16 sm:py-24 border-b border-card-border bg-muted/20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Explore Product Categories"
          subtitle="Browse our organized taxonomy of developer tools, design tokens, templates, and architectural guides."
          badge="Categories"
          align="center"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLACEHOLDER_CATEGORIES.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`} className="group">
              <Card className="h-full transition-all group-hover:border-accent/50 group-hover:shadow-md">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <CardTitle className="group-hover:text-accent transition-colors flex items-center justify-between">
                    <span>{category.name}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {category.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
