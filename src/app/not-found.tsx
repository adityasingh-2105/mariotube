import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Play, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-secondary/15 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/60 mb-6">
        <HelpCircle className="h-10 w-10 text-primary animate-pulse" />
      </div>
      <h1 className="font-display font-extrabold text-5xl md:text-6xl text-foreground mb-4">
        404
      </h1>
      <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mb-2">
        Page Not Found
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed">
        The page you are looking for doesn't exist or has been moved to another location.
      </p>
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "default" }),
          "rounded-full shadow-lg shadow-primary/20 gap-2 px-6 flex items-center justify-center"
        )}
      >
        <Play className="h-4 w-4 fill-current stroke-none ml-0.5" />
        Back to Home
      </Link>
    </div>
  );
}
