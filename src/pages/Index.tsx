import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Calendar, Megaphone, FileText, ClipboardList, CheckSquare, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  { icon: Calendar, title: "Timetable", desc: "Weekly schedules at a glance." },
  { icon: Megaphone, title: "Notices", desc: "Stay updated with announcements." },
  { icon: FileText, title: "Notes", desc: "Download study materials by subject." },
  { icon: ClipboardList, title: "Assignments", desc: "Track work and deadlines." },
  { icon: CheckSquare, title: "Attendance", desc: "Subject-wise tracking & insights." },
];

const Index = () => {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/app" replace />;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="container flex items-center justify-between py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-elegant">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Smart Campus</span>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button>
          <Button asChild><Link to="/auth?mode=signup">Get started</Link></Button>
        </div>
      </header>

      <section className="container py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Modern campus management
          </div>
          <h1 className="bg-gradient-primary bg-clip-text text-4xl font-bold leading-tight tracking-tight text-transparent sm:text-6xl">
            Run your campus, all in one place.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground">
            Timetables, notices, notes, assignments and attendance — built for students and teachers.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link to="/auth?mode=signup">Get started <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group rounded-xl border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elegant">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="container py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Smart Campus. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;
