import Link from "next/link";
import { SITE_CONFIG } from "@/lib/config/site";
import { Container } from "./container";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-card-border bg-background/80 backdrop-blur-md transition-all">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground hover:opacity-90 transition-opacity"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono font-bold text-sm">
              S
            </div>
            <span>{SITE_CONFIG.shortName}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {SITE_CONFIG.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/about">About</Link>
          </Button>
          <Button size="sm" asChild className="gap-2">
            <Link href="/products">
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Store</span>
            </Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}
