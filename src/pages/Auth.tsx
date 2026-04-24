import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { GraduationCap, ArrowLeft, Sparkles, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(72),
});
const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(1, "Name required").max(100),
});

export default function Auth() {
  const { user, loading } = useAuth();
  const [params] = useSearchParams();
  const initialTab = params.get("mode") === "signup" ? "signup" : "signin";
  const [tab, setTab] = useState(initialTab);
  const [submitting, setSubmitting] = useState(false);
  const [signupSentTo, setSignupSentTo] = useState<string | null>(null);

  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  useEffect(() => setTab(initialTab), [initialTab]);

  if (!loading && user) return <Navigate to="/app" replace />;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signInSchema.safeParse({ email: signinEmail, password: signinPassword });
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setSubmitting(false);
    if (error) toast.error(error.message);
    else toast.success("Welcome back!");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signUpSchema.safeParse({
      fullName: signupName,
      email: signupEmail,
      password: signupPassword,
    });
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: parsed.data.fullName },
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSignupSentTo(parsed.data.email);
    toast.success("Account created. Check your inbox to verify.");
  };

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      {/* Left: form */}
      <div className="relative flex flex-col bg-background">
        <div className="flex items-center justify-between p-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to home
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

            <h1 className="font-display text-3xl font-bold tracking-tight">
              {tab === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {tab === "signin"
                ? "Sign in to continue to your dashboard."
                : "Free forever for the core modules."}
            </p>

            <Tabs value={tab} onValueChange={setTab} className="mt-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="si-email">Email</Label>
                    <Input id="si-email" type="email" placeholder="you@example.com" value={signinEmail} onChange={(e) => setSigninEmail(e.target.value)} required className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="si-password">Password</Label>
                      <Link
                        to="/forgot-password"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input id="si-password" type="password" placeholder="••••••••" value={signinPassword} onChange={(e) => setSigninPassword(e.target.value)} required className="h-11" />
                  </div>
                  <Button type="submit" disabled={submitting} className="h-11 w-full shadow-glow">
                    {submitting ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                {signupSentTo ? (
                  <div className="mt-6 space-y-4 rounded-2xl border bg-card p-6 text-center shadow-elegant">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <MailCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold">Verify your email</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        We've sent a confirmation link to{" "}
                        <span className="font-medium text-foreground">{signupSentTo}</span>. Click it to activate your account, then sign in.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button onClick={() => setTab("signin")} className="h-11 w-full shadow-glow">
                        Go to sign in
                      </Button>
                      <Button
                        variant="outline"
                        className="h-11 w-full"
                        onClick={() => {
                          setSignupSentTo(null);
                          setSignupEmail("");
                          setSignupPassword("");
                          setSignupName("");
                        }}
                      >
                        Use a different email
                      </Button>
                    </div>
                  </div>
                ) : (
                <form onSubmit={handleSignUp} className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="su-name">Full name</Label>
                    <Input id="su-name" placeholder="Jane Doe" value={signupName} onChange={(e) => setSignupName(e.target.value)} required className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-email">Email</Label>
                    <Input id="su-email" type="email" placeholder="you@example.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-password">Password</Label>
                    <Input id="su-password" type="password" placeholder="At least 6 characters" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required minLength={6} className="h-11" />
                  </div>
                  <Button type="submit" disabled={submitting} className="h-11 w-full shadow-glow">
                    {submitting ? "Creating account..." : "Create account"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    The first registered account becomes Admin. All others are Students.
                  </p>
                </form>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Right: visual */}
      <div className="relative hidden overflow-hidden bg-gradient-vivid lg:block">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" /> Smart Campus Platform
          </div>
          <div className="space-y-6">
            <h2 className="font-display text-4xl font-bold leading-tight">
              "Everything our college needs, finally in one place — and it actually looks great."
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 font-semibold backdrop-blur-md">
                AR
              </div>
              <div>
                <p className="font-semibold">Aarav Reddy</p>
                <p className="text-sm text-primary-foreground/80">Computer Science · Year 3</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { v: "7", l: "Modules" },
              { v: "100%", l: "Secure" },
              { v: "<2s", l: "Loads" },
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