import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  badge,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 mb-10 sm:mb-12",
        align === "center" && "text-center items-center mx-auto max-w-2xl",
        className
      )}
    >
      {badge && (
        <span className="text-xs font-mono font-semibold tracking-wider text-accent uppercase">
          {badge}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
