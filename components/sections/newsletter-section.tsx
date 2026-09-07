import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Bell } from "lucide-react";

export function NewsletterSection() {
  return (
    <section className="py-16 sm:py-20 bg-card border-b border-card-border">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted text-foreground mb-4">
          <Bell className="w-5 h-5 text-accent" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          Product Releases & Architecture Updates
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mb-8">
          Stay informed as new starter kits, design token packages, and technical guides are released.
        </p>

        <div className="p-4 rounded-xl border border-card-border bg-muted/30 max-w-md mx-auto text-center space-y-2">
          <p className="text-xs font-mono font-semibold text-accent uppercase tracking-wider">
            Newsletter Service — Coming Soon
          </p>
          <p className="text-xs text-muted-foreground">
            Email subscriptions will activate alongside our initial product catalog release. No user data is collected prior to service setup.
          </p>
        </div>
      </div>
    </section>
  );
}
