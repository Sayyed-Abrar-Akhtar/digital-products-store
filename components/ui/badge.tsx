import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "accent";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-muted text-muted-foreground",
    outline: "border border-card-border text-foreground",
    accent: "bg-accent text-accent-foreground font-semibold",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-mono font-medium transition-colors select-none",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
