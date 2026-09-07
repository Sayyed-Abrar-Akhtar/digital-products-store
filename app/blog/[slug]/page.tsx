import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { BLOG_POSTS } from "@/lib/data/store-data";
import { SITE_CONFIG } from "@/lib/config/site";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Calendar, User, Clock, ChevronRight } from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `${SITE_CONFIG.url}/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "datePublished": post.publishedAt,
    "author": {
      "@type": "Person",
      "name": post.author.name,
      "jobTitle": post.author.role,
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_CONFIG.name,
      "url": SITE_CONFIG.url,
    },
  };

  return (
    <Container className="py-12 sm:py-16 max-w-4xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs font-mono text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/blog" className="hover:text-foreground transition-colors">
          Blog
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground truncate max-w-[200px] sm:max-w-none">{post.title}</span>
      </nav>

      <article className="space-y-8">
        <header className="space-y-4 border-b border-card-border pb-8">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{post.category}</Badge>
            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground pt-2">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-accent" />
              {post.author.name} ({post.author.role})
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              {formatDate(post.publishedAt)}
            </span>
          </div>
        </header>

        <div className="text-base leading-relaxed space-y-4 text-muted-foreground whitespace-pre-line">
          {post.content}
        </div>
      </article>
    </Container>
  );
}
