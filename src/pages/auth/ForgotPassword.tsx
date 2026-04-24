import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, GraduationCap, MailCheck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
});

export default function ForgotPassword() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  if (!loading && user) return <Navigate to="/app" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Reset link sent. Check your inbox.");
  };

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="relative flex flex-col bg-background">
        <div className="flex items-center justify-between p-6">
          <Link to="/auth" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md animate-fade-in">
            <Link to="/" className="mb-8 flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-vivid shadow-glow">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight">Smart Campus</span>
            </Link>

            <h1 className="font-display text-3xl font-bold tracking-tight">Forgot your password?</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the email you signed up with and we'll send you a secure link to set a new password.
            </p>

            {sent ? (
              <div className="mt-8 space-y-4 rounded-2xl border bg-card p-6 text-center shadow-elegant">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MailCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">Check your inbox</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>. The link expires in 1 hour.
                  </p>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/auth">Return to sign in</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fp-email">Email</Label>
                  <Input
                    id="fp-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <Button type="submit" disabled={submitting} className="h-11 w-full shadow-glow">
                  {submitting ? "Sending link..." : "Send reset link"}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Remembered it?{" "}
                  <Link to="/auth" className="font-medium text-primary hover:underline">
                    Sign in instead
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-vivid lg:block">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" /> Account recovery
          </div>
          <div className="space-y-6">
            <h2 className="font-display text-4xl font-bold leading-tight">
              Lost access? You'll be back inside in under a minute.
            </h2>
            <p className="text-primary-foreground/80">
              Reset links are single-use and expire automatically — your account stays secure.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { v: "1h", l: "Link valid" },
              { v: "256-bit", l: "Encryption" },
              { v: "24/7", l: "Recovery" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                <div className="font-display text-2xl font-bold">{s.v}</div>
                <div className="text-xs text-primary-foreground/80">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}