import { SectionHeader } from "@/components/ui/section-header";
import { ShieldCheck, Zap, Code, RefreshCw } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Ultra-Fast Performance",
    description: "Built strictly on Next.js 16 Server Components for instant load times and optimal Core Web Vitals.",
  },
  {
    icon: Code,
    title: "Clean TypeScript Codebase",
    description: "Well-structured, strongly typed code without unnecessary dependencies or messy abstractions.",
  },
  {
    icon: ShieldCheck,
    title: "Production Ready Architecture",
    description: "Built with security, accessibility, and WCAG compliance in mind from day one.",
  },
  {
    icon: RefreshCw,
    title: "Continuous Updates",
    description: "Regular updates ensuring compatibility with the latest Next.js releases and web standards.",
  },
];

export function WhyChooseUsSection() {
  return (
    <section className="py-16 sm:py-24 border-b border-card-border bg-muted/20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Engineered for Production Standards"
          subtitle="We focus on developer ergonomics, accessibility, and high performance."
          badge="Why Choose Us"
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
