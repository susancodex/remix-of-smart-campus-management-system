import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        emailRedirectTo: `${window.location.origin}/app`,
        data: { full_name: parsed.data.fullName },
      },
    });
    setSubmitting(false);
    if (error) toast.error(error.message);
    else toast.success("Account created! You can sign in now.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-subtle p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-elegant">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Smart Campus</span>
        </Link>
        <Card className="border-border/60 shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>Sign in or create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="si-email">Email</Label>
                    <Input id="si-email" type="email" value={signinEmail} onChange={(e) => setSigninEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="si-password">Password</Label>
                    <Input id="si-password" type="password" value={signinPassword} onChange={(e) => setSigninPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="su-name">Full name</Label>
                    <Input id="su-name" value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-email">Email</Label>
                    <Input id="su-email" type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-password">Password</Label>
                    <Input id="su-password" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required minLength={6} />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? "Creating account..." : "Create account"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    The first registered account becomes the Admin. All others are Students.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}