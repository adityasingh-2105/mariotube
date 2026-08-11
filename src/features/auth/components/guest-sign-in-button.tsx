'use client';

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { UserCheck } from "lucide-react";

export function GuestSignInButton({
  className,
}: {
  className?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      // Sign in using our Developer Credentials provider
      await signIn("credentials", { callbackUrl: "/" });
    } catch (error) {
      console.error("Guest login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className={className}
      disabled={isLoading}
      onClick={handleSignIn}
    >
      <UserCheck className="w-4 h-4 mr-2 text-primary" />
      {isLoading ? "Entering Guest Mode..." : "Continue as Guest"}
    </Button>
  );
}
