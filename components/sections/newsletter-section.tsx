import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export function NewsletterSection() {
  return (
    <section className="py-16 sm:py-20 bg-card border-b border-card-border">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted text-foreground mb-4">
          <Mail className="w-5 h-5 text-accent" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          Subscribe to Product & Architecture Updates
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mb-8">
          Get notified when new digital tools, starter kits, or technical deep-dives are published. No spam ever.
        </p>

        <form
          action="#"
          className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
        >
          <Input
            type="email"
            placeholder="Enter your email address"
            className="w-full"
            aria-label="Email address for newsletter"
            required
          />
          <Button type="submit" className="w-full sm:w-auto shrink-0">
            Subscribe [Placeholder]
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-3">
          Note: Newsletter subscription form placeholder for foundation build.
        </p>
      </div>
    </section>
  );
}
