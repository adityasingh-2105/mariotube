'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, Lock, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";
  const identifier = searchParams.get("identifier") || "";
  const type = (searchParams.get("type") || "email") as "email" | "phone";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 4) {
      toast.error("Password must be at least 4 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!token || !identifier) {
      toast.error("Invalid reset link. Please request a new link.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "execute-reset",
          token,
          identifier,
          type,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");

      toast.success("Password updated successfully!");
      setIsSuccess(true);

      // Auto sign-in with new password
      await signIn("credentials", {
        redirect: false,
        type: type === "phone" ? "phone-password" : "email-password",
        identifier,
        password: newPassword,
      });

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4 py-8">
        <p className="text-sm text-destructive font-semibold">
          Missing or invalid reset token. Please request a reset link from the login page.
        </p>
        <Link href="/login" className="inline-block">
          <Button variant="outline" className="rounded-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {identifier && (
        <div className="p-3 bg-secondary/40 rounded-xl border border-border/40 text-xs">
          <span className="text-muted-foreground">Resetting password for: </span>
          <span className="font-bold text-foreground">{identifier}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase">New Password</label>
        <Input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="rounded-xl bg-muted/20 border-border/60"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase">Confirm New Password</label>
        <Input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="rounded-xl bg-muted/20 border-border/60"
          required
        />
      </div>

      {isSuccess ? (
        <div className="p-3 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl flex items-center justify-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="h-4 w-4" />
          <span>Password changed! Signing you in...</span>
        </div>
      ) : (
        <Button
          type="submit"
          disabled={loading || !newPassword || !confirmPassword}
          className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/10 gap-2 mt-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          Update Password & Sign In
        </Button>
      )}

      <div className="text-center pt-2">
        <Link href="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          Remember your password? Sign in
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative w-full max-w-md p-4 mx-auto my-12">
      <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-accent/15 blur-3xl pointer-events-none" />

      <Card className="rounded-3xl border border-border/40 shadow-2xl bg-card/85 backdrop-blur-xl relative overflow-hidden">
        <CardHeader className="text-center pt-8 pb-4">
          <div className="flex justify-center mb-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
              <KeyRound className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="font-display font-extrabold text-2xl tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Set New Password
          </CardTitle>
          <CardDescription className="text-xs font-medium text-muted-foreground mt-1">
            Choose a strong password to protect your MarioTube account
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 pt-2">
          <Suspense fallback={<div className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>}>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
