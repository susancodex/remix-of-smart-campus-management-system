import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, GraduationCap, Loader2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Status = "loading" | "success" | "error" | "recovery";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Confirming your account...");

  useEffect(() => {
    const run = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const errorDescription =
        url.searchParams.get("error_description") ||
        new URLSearchParams(url.hash.replace(/^#/, "")).get("error_description");
      const hashType = new URLSearchParams(url.hash.replace(/^#/, "")).get("type");

      if (errorDescription) {
        setStatus("error");
        setMessage(decodeURIComponent(errorDescription));
        return;
      }

      // PKCE / OAuth / email confirmation links carry ?code=
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }
      }

      // Recovery links (hash flow) — send user to reset-password page
      if (hashType === "recovery") {
        navigate("/reset-password" + window.location.hash, { replace: true });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStatus("success");
        setMessage("Email confirmed. Redirecting to your dashboard...");
        setTimeout(() => navigate("/app", { replace: true }), 1200);
      } else {
        setStatus("error");
        setMessage("This confirmation link is invalid or has expired.");
      }
    };
    run();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-elegant animate-fade-in">
        <Link to="/" className="mb-6 inline-flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-vivid shadow-glow">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">Smart Campus</span>
        </Link>

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          {status === "loading" && <Loader2 className="h-7 w-7 animate-spin text-primary" />}
          {status === "success" && <CheckCircle2 className="h-7 w-7 text-primary" />}
          {status === "error" && <XCircle className="h-7 w-7 text-destructive" />}
        </div>

        <h1 className="font-display text-2xl font-bold tracking-tight">
          {status === "loading" && "Just a moment"}
          {status === "success" && "You're verified"}
          {status === "error" && "Verification failed"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>

        {status === "error" && (
          <div className="mt-6 flex flex-col gap-2">
            <Button asChild className="h-11 w-full shadow-glow">
              <Link to="/auth?mode=signup">Create a new account</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 w-full">
              <Link to="/auth">Back to sign in</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}