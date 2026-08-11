import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export function SignInButton({
  className,
  variant = "outline",
  size = "default",
}: {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon" | "xs";
}) {
  return (
    <Link href="/login" className="inline-block">
      <Button
        variant={variant}
        size={size}
        className={`rounded-full gap-2 font-semibold border-primary/40 hover:bg-primary/10 text-primary ${className || ""}`}
      >
        <User className="h-4 w-4" />
        <span>Sign in</span>
      </Button>
    </Link>
  );
}
