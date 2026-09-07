import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Code2, Download } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 border-b border-card-border bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <Badge variant="outline" className="mb-6 px-3 py-1 gap-2 border-slate-300 dark:border-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Production-Grade Digital Architecture & Tools</span>
        </Badge>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.15] text-foreground mb-6">
          Premium Digital Products Built for Modern Engineers & Creators
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
          Production-ready starter kits, design systems, and architecture guides crafted with strict Next.js 16, React 19, and TypeScript standards.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Button size="lg" asChild className="w-full sm:w-auto gap-2">
            <Link href="/products">
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          <Button size="lg" variant="outline" asChild className="w-full sm:w-auto gap-2">
            <Link href="/free">
              <Download className="w-4 h-4 text-muted-foreground" />
              <span>Free Resources</span>
            </Link>
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-card-border max-w-3xl w-full text-center">
          <div>
            <div className="text-xl font-bold font-mono">Next.js 16</div>
            <div className="text-xs text-muted-foreground mt-0.5">App Router Powered</div>
          </div>
          <div>
            <div className="text-xl font-bold font-mono">TypeScript</div>
            <div className="text-xs text-muted-foreground mt-0.5">Strict Type Safety</div>
          </div>
          <div>
            <div className="text-xl font-bold font-mono">Zero Bloat</div>
            <div className="text-xs text-muted-foreground mt-0.5">Modern Dependencies</div>
          </div>
          <div>
            <div className="text-xl font-bold font-mono">100% Free</div>
            <div className="text-xs text-muted-foreground mt-0.5">Open Learning Assets</div>
          </div>
        </div>
      </div>
    </section>
  );
}
