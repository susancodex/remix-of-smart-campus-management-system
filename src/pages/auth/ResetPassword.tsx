import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, GraduationCap, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters").max(72),
    confirm: z.string().min(6).max(72),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Supabase recovery links sign the user in temporarily and emit PASSWORD_RECOVERY
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });

    // Fallback: if there's already a session (link was opened), allow reset
    supabase.auth.getSession().then(({ data: { session } }) => {
      const hash = window.location.hash || "";
      const isRecovery = hash.includes("type=recovery");
      if (session || isRecovery) setReady(true);
      else {
        // Give the auth listener a brief moment before flagging invalid
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (!s) setInvalid(true);
          });
        }, 800);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ password, confirm });
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated. You're all set.");
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
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

            <h1 className="font-display text-3xl font-bold tracking-tight">Set a new password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose a strong password you haven't used before. You'll be signed out everywhere after the change.
            </p>

            {invalid && !ready ? (
              <div className="mt-8 space-y-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                <p className="font-semibold text-destructive">Reset link invalid or expired</p>
                <p className="text-sm text-muted-foreground">
                  Request a new link from the forgot password page.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/forgot-password">Request a new link</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rp-password">New password</Label>
                  <Input
                    id="rp-password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-11"
                    disabled={!ready}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rp-confirm">Confirm password</Label>
                  <Input
                    id="rp-confirm"
                    type="password"
                    placeholder="Repeat your new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={6}
                    className="h-11"
                    disabled={!ready}
                  />
                </div>
                <Button type="submit" disabled={submitting || !ready} className="h-11 w-full shadow-glow">
                  <Lock className="mr-2 h-4 w-4" />
                  {submitting ? "Updating..." : ready ? "Update password" : "Verifying link..."}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-vivid lg:block">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" /> Secure recovery
          </div>
          <div className="space-y-6">
            <h2 className="font-display text-4xl font-bold leading-tight">
              One last step — pick a password only you would know.
            </h2>
            <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
              <ShieldCheck className="h-5 w-5" />
              <p className="text-sm">
                Passwords are hashed and never stored in plain text.
              </p>
            </div>
          </div>
          <div className="text-xs text-primary-foreground/80">
            Tip: mix letters, numbers and a symbol for the strongest result.
          </div>
        </div>
      </div>
    </div>
  );
}