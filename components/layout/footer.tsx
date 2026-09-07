import Link from "next/link";
import { SITE_CONFIG } from "@/lib/config/site";
import { Container } from "./container";

export function Footer() {
  return (
    <footer className="border-t border-card-border bg-card/50 mt-auto">
      <Container className="py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1 flex flex-col space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-mono font-bold text-xs">
                S
              </div>
              <span>{SITE_CONFIG.name}</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              {SITE_CONFIG.description}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-mono font-semibold tracking-wider text-foreground uppercase mb-4">
              Products
            </h4>
            <ul className="space-y-2.5 text-sm">
              {SITE_CONFIG.footerNav.store.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-semibold tracking-wider text-foreground uppercase mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              {SITE_CONFIG.footerNav.company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-semibold tracking-wider text-foreground uppercase mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              {SITE_CONFIG.footerNav.legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-card-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.</p>
          <p className="font-mono text-[11px]">
            Domain: <a href={SITE_CONFIG.url} className="underline hover:text-foreground">{SITE_CONFIG.url.replace('https://', '')}</a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
