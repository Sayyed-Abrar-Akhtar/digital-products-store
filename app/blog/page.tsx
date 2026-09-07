import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/ui/section-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BLOG_POSTS } from "@/lib/data/store-data";
import { SITE_CONFIG } from "@/lib/config/site";
import { formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Engineering & Architecture Blog",
  description: "Articles, deep-dives, and technical insights on Next.js 16, web performance, and software architecture.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/blog`,
  },
};

export default function BlogPage() {
  return (
    <Container className="py-12 sm:py-16">
      <SectionHeader
        title="Technical Insights & Blog"
        subtitle="Articles and architectural case studies covering full-stack web engineering."
        badge="Blog & Insights"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {BLOG_POSTS.map((post) => (
          <Card key={post.id} className="flex flex-col justify-between p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{post.category}</Badge>
                <span className="text-xs font-mono text-muted-foreground">{post.readTime}</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">{post.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>
            </div>

            <div className="pt-6 border-t border-card-border mt-6 flex items-center justify-between text-xs text-muted-foreground">
              <span>By {post.author.name} • {formatDate(post.publishedAt)}</span>
              <Button size="sm" variant="ghost" asChild className="gap-1.5 text-accent hover:text-accent">
                <Link href={`/blog/${post.slug}`}>
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}
