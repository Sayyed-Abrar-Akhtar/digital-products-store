"use client";

import { useState } from "react";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/config/site";
import { Container } from "./container";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Menu, X } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-card-border bg-background/80 backdrop-blur-md transition-all">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground hover:opacity-90 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono font-bold text-sm">
              S
            </div>
            <span>{SITE_CONFIG.shortName}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
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
          <Button size="sm" asChild className="gap-2 hidden xs:inline-flex">
            <Link href="/products">
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Store</span>
            </Link>
          </Button>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </Container>

      {/* Mobile navigation overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-card-border bg-background px-4 pt-4 pb-6 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-2" aria-label="Mobile Navigation">
            {SITE_CONFIG.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium p-2 rounded-md text-foreground hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.title}
              </Link>
            ))}
            <Link
              href="/about"
              className="text-sm font-medium p-2 rounded-md text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <div className="pt-2">
              <Button size="sm" asChild className="w-full gap-2">
                <Link href="/products" onClick={() => setMobileMenuOpen(false)}>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Browse Store</span>
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
