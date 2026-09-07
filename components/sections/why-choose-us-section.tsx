import { SectionHeader } from "@/components/ui/section-header";
import { ShieldCheck, Zap, Code, Layout } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Server-First Performance",
    description: "Architected with Next.js 16 Server Components to minimize client JavaScript overhead and optimize page delivery.",
  },
  {
    icon: Code,
    title: "Strict TypeScript Standards",
    description: "Strongly typed codebase without unnecessary dependencies or messy runtime abstractions.",
  },
  {
    icon: ShieldCheck,
    title: "Accessible & Responsive",
    description: "Crafted with semantic HTML, fluid layouts, clear focus rings, and dark theme support.",
  },
  {
    icon: Layout,
    title: "Clean Modular Structure",
    description: "Decoupled data layer and UI presentation ready for future database and authentication integration.",
  },
];

export function WhyChooseUsSection() {
  return (
    <section className="py-16 sm:py-24 border-b border-card-border bg-muted/20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Engineered to Modern Production Standards"
          subtitle="Focused on clean code ergonomics, accessibility, and lightweight architecture."
          badge="Engineering Standards"
          align="center"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="flex flex-col space-y-3">
                <div className="w-10 h-10 rounded-lg bg-card border border-card-border flex items-center justify-center text-foreground font-bold shadow-sm">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-base font-bold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
