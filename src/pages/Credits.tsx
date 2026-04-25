import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, GraduationCap, Github, Globe, Mail, Heart, Sparkles } from "lucide-react";

const stack = [
  "React 18",
  "Vite 5",
  "TypeScript",
  "Tailwind CSS",
  "shadcn/ui",
  "Lovable Cloud",
];

const Credits = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-grid opacity-40 [mask-image:linear-gradient(to_bottom,white,transparent)]" />

      <header className="relative z-10">
        <nav className="container flex items-center justify-between py-5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-vivid shadow-glow">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">Smart Campus</span>
          </Link>
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" /> Back home
            </Link>
          </Button>
        </nav>
      </header>

      <main className="relative z-10 container max-w-3xl py-12 sm:py-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Credits
          </div>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Built with <Heart className="inline h-8 w-8 fill-primary text-primary" /> by Susan Acharya
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Smart Campus is designed and developed end-to-end by Susan Acharya — a focused
            campus operating system for students, teachers and admins.
          </p>
        </div>

        <Card className="mt-10 border-border/60 bg-card/70 p-8 backdrop-blur">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-vivid text-3xl font-bold text-primary-foreground shadow-glow">
              SA
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-display text-2xl font-semibold">Susan Acharya</h2>
              <p className="text-sm text-muted-foreground">Creator · Designer · Developer</p>
              <p className="mt-3 text-sm text-foreground/80">
                Thanks for checking out the project. If you'd like to collaborate, report a bug,
                or just say hi — the links below are the best way to reach me.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <a href="https://github.com/" target="_blank" rel="noreferrer">
                    <Github className="h-4 w-4" /> GitHub
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <a href="mailto:hello@example.com">
                    <Mail className="h-4 w-4" /> Email
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <a href="https://example.com" target="_blank" rel="noreferrer">
                    <Globe className="h-4 w-4" /> Website
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="mt-6 border-border/60 bg-card/70 p-8 backdrop-blur">
          <h3 className="font-display text-lg font-semibold">Built with</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Open-source tools that make modern apps possible.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {stack.map((s) => (
              <span
                key={s}
                className="rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-foreground/80"
              >
                {s}
              </span>
            ))}
          </div>
        </Card>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Smart Campus. All rights reserved.
        </p>
      </main>
    </div>
  );
};

export default Credits;