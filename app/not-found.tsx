import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-24 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted text-muted-foreground mb-6 text-xl font-bold font-mono">
        404
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
        Page Not Found
      </h1>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        The page or resource you are looking for does not exist or has been moved to another section.
      </p>
      <div className="flex items-center justify-center gap-4">
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    </div>
  );
}
