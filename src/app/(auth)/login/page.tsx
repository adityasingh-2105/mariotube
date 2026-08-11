'use client';

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldCheck, Sparkles, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  // Trigger Real Google OAuth 2.0 (redirects to accounts.google.com like Spotify/YouTube)
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Google sign in error:", error);
      toast.error("Google Sign-In failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 my-8">
      <Card className="rounded-3xl border border-border/40 shadow-2xl bg-card/90 backdrop-blur-xl relative overflow-hidden text-center p-2 sm:p-4">
        {/* Glow decoration */}
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-accent/15 blur-3xl pointer-events-none" />

        <CardHeader className="pt-8 pb-4 space-y-3">
          {/* MarioTube Logo */}
          <div className="flex justify-center">
            <svg
              viewBox="0 0 100 100"
              className="h-16 w-16 hover:rotate-12 transition-transform duration-300 shrink-0 drop-shadow-md"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="10" className="text-zinc-800 dark:text-zinc-200" />
              <path d="M 50,8 A 42,42 0 0,1 92,50" stroke="#f83800" strokeWidth="10" fill="none" />
              <path d="M 8,50 A 42,42 0 0,1 50,8" stroke="#f83800" strokeWidth="10" fill="none" />
              <path d="M 50,50 L 50,15" stroke="currentColor" strokeWidth="8" className="text-zinc-400 dark:text-zinc-600" />
              <path d="M 50,50 L 20,68" stroke="currentColor" strokeWidth="8" className="text-zinc-400 dark:text-zinc-600" />
              <path d="M 50,50 L 80,68" stroke="currentColor" strokeWidth="8" className="text-zinc-400 dark:text-zinc-600" />
              <circle cx="50" cy="50" r="18" fill="#f83800" stroke="#ffffff" strokeWidth="3" />
              <polygon points="46,41 60,50 46,59" fill="#ffffff" />
            </svg>
          </div>

          <CardTitle className="font-display font-extrabold text-3xl tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to MarioTube
          </CardTitle>
          <CardDescription className="text-sm font-medium text-muted-foreground max-w-[280px] mx-auto">
            Sign in with your Google account to watch, like, and subscribe.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-2 pb-8 px-6">
          {/* Main Google Sign-In Button (Spotify/Notion style) */}
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-13 py-3.5 px-6 rounded-2xl font-semibold text-base bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-white dark:border-zinc-700"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </Button>

          {/* Security note */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span>Secure authentication powered by Google OAuth 2.0</span>
          </div>

          <div className="pt-4 border-t border-border/40 space-y-2 text-[11px] text-muted-foreground">
            <p>
              By signing in, you agree to MarioTube's{" "}
              <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                Privacy Policy
              </a>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
