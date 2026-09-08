import Link from "next/link";
import { Product } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Sparkles, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const isFree = product.isFree || product.price === 0;
  const isComingSoon = product.status === "coming_soon";
  const isInDev = product.status === "in_development";

  return (
    <Card className={`flex flex-col h-full group hover:shadow-md transition-all duration-200 border-card-border relative overflow-hidden ${className || ""}`}>
      {/* Top Banner / Badges */}
      <CardHeader className="space-y-2.5 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="secondary" className="text-[11px] font-mono">
              {product.categoryName}
            </Badge>

            {isFree ? (
              <Badge variant="accent" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                Free Resource
              </Badge>
            ) : isComingSoon ? (
              <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Coming Soon
              </Badge>
            ) : isInDev ? (
              <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10 text-[11px] flex items-center gap-1">
                In Development
              </Badge>
            ) : null}
          </div>

          {product.featured && (
            <Badge variant="accent" className="text-[10px] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Featured
            </Badge>
          )}
        </div>

        <CardTitle className="text-xl font-bold group-hover:text-accent transition-colors line-clamp-1">
          <Link href={`/products/${product.slug}`} className="focus:outline-none focus:underline">
            {product.name}
          </Link>
        </CardTitle>

        <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
          {product.shortDescription}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 flex-1">
        {/* Features preview */}
        {product.features && product.features.length > 0 && (
          <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
            {product.features.slice(0, 3).map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2 line-clamp-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                <span className="truncate">{feature}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {product.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] font-normal py-0 px-2 bg-muted/30">
                #{tag}
              </Badge>
            ))}
            {product.tags.length > 4 && (
              <span className="text-[10px] text-muted-foreground self-center">
                +{product.tags.length - 4} more
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4 mt-auto border-t border-card-border bg-muted/10">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-extrabold font-mono text-foreground">
            {formatCurrency(product.price, product.currency)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through font-mono">
              {formatCurrency(product.compareAtPrice, product.currency)}
            </span>
          )}
        </div>

        <Button size="sm" variant={isFree ? "outline" : "default"} asChild className="gap-1 font-medium">
          <Link href={`/products/${product.slug}`} aria-label={`View details for ${product.name}`}>
            <span>View Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
