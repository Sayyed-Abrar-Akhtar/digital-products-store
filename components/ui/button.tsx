import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-md font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none";

    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm",
      secondary: "bg-muted text-foreground hover:bg-slate-200 dark:hover:bg-slate-800",
      outline: "border border-card-border bg-transparent text-foreground hover:bg-muted",
      ghost: "hover:bg-muted text-foreground",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-xs",
      lg: "h-12 px-6 text-base",
    };

    if (asChild && React.isValidElement(props.children)) {
      return React.cloneElement(props.children as React.ReactElement<{ className?: string }>, {
        className: cn(baseStyles, variants[variant], sizes[size], className, (props.children.props as { className?: string }).className),
      });
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
