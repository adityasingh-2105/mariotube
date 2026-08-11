'use client';

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-secondary/15 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20 mb-6">
        <AlertTriangle className="h-10 w-10 text-destructive animate-bounce" />
      </div>
      <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mb-2">
        Something went wrong!
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed">
        {error.message || "An unexpected error occurred. Please try reloading the page."}
      </p>
      <Button onClick={reset} className="rounded-full shadow-lg gap-2 px-6">
        <RotateCcw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}
