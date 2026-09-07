"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-24 text-center">
      <h2 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-6">
        An unhandled error occurred while processing your request.
      </p>
      <Button onClick={() => reset()}>Try Again</Button>
    </div>
  );
}
