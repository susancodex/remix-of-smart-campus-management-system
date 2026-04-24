import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Calendar,
  Megaphone,
  FileText,
  ClipboardList,
  CheckSquare,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Users,
  Check,
  Star,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

const features = [
  { icon: Calendar, title: "Smart Timetable", desc: "Weekly schedules with day-by-day organization for every student and teacher." },
  { icon: Megaphone, title: "Live Notice Board", desc: "Announcements with priority flags so nothing important slips by." },
  { icon: FileText, title: "Notes Library", desc: "Upload, share and download study materials by subject in seconds." },
  { icon: ClipboardList, title: "Assignment Tracker", desc: "Set deadlines, track submissions, surface overdue work automatically." },
  { icon: CheckSquare, title: "Attendance Insights", desc: "Subject-wise percentages with progress bars and history." },
  { icon: Users, title: "Role-based Access", desc: "Admins manage everything. Students get a focused, read-only view." },
];

const stats = [
  { value: "7", label: "Powerful modules" },
  { value: "100%", label: "Role-secured" },
  { value: "<2s", label: "Page loads" },
  { value: "24/7", label: "Cloud backed" },
];

const Index = () => {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/app" replace />;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-grid opacity-40 [mask-image:linear-gradient(to_bottom,white,transparent)]" />

      <header className="relative z-10">
        <nav className="container flex items-center justify-between py-5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-vivid shadow-glow">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">Smart Campus</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild className="shadow-glow">
              <Link to="/auth?mode=signup" className="gap-1.5">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 container pb-20 pt-12 sm:pt-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Modern campus management, reimagined
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
            Run your entire campus
            <span className="mt-2 block text-gradient">in one beautiful place.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
            Timetables, notices, notes, assignments and attendance — a single, fast,
            role-based platform built for students and teachers.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 gap-2 px-7 text-base shadow-glow">
              <Link to="/auth?mode=signup">
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
              <Link to="/auth">View demo</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> Free to start</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> No credit card</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> Setup in seconds</span>
          </div>
        </div>

        {/* Hero preview card */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="relative rounded-2xl border border-border/60 bg-card/60 p-2 shadow-elegant backdrop-blur-md">
            <div className="absolute -inset-px rounded-2xl bg-gradient-vivid opacity-20 blur-xl" />
            <div className="relative rounded-xl border border-border/60 bg-background overflow-hidden">
              <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
                <div className="ml-3 text-xs text-muted-foreground">smartcampus.app/dashboard</div>
              </div>
              <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-lg border border-border/60 bg-card p-4">
                    <div className="font-display text-3xl font-bold text-gradient">{s.value}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-medium text-primary">Everything you need</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Built for the way campuses really work
          </h2>
          <p className="mt-4 text-muted-foreground">
            Six tightly integrated modules. One unified experience.
          </p>
        </div>
        <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-glow"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-all group-hover:bg-gradient-vivid group-hover:text-primary-foreground group-hover:shadow-glow">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="relative z-10 container py-20">
        <div className="grid gap-8 lg:grid-cols-3">
          {[
            { icon: Zap, title: "Lightning fast", desc: "Built on a modern React + edge stack. Instant navigation, zero waiting." },
            { icon: Shield, title: "Secure by design", desc: "Row-level security, role-based access and audited authentication." },
            { icon: Star, title: "Loved by students", desc: "Clean UX with dark mode, keyboard-friendly, and fully responsive." },
          ].map((b) => (
            <div key={b.title} className="rounded-2xl border border-border/60 bg-card p-7 shadow-card">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-vivid text-primary-foreground shadow-glow">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 container py-20">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-vivid p-10 text-center shadow-elegant sm:p-16">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative">
            <h2 className="font-display text-2xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
              Ready to modernize your campus?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/90">
              The first account becomes Admin. Everyone else joins as a student. Get up and running in under a minute.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8 h-12 gap-2 px-7 text-base">
              <Link to="/auth?mode=signup">
                Create your account <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/60">
        <div className="container flex flex-col items-center justify-between gap-3 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-vivid">
              <GraduationCap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span>© {new Date().getFullYear()} Smart Campus. Created by Susan Acharya.</span>
          </div>
          <div className="flex gap-5">
            <Link to="/auth" className="hover:text-foreground transition-colors">Sign in</Link>
            <Link to="/auth?mode=signup" className="hover:text-foreground transition-colors">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;