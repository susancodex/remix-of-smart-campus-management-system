import { useEffect, useState } from "react";
import { Calendar, ClipboardList, Megaphone, Percent, FileText, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Stats {
  assignments: number;
  pending: number;
  notices: number;
  attendance: number;
}

export default function Dashboard() {
  const { user, role, fullName } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentNotices, setRecentNotices] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [a, n, statuses, att, recent, up] = await Promise.all([
        supabase.from("assignments").select("id", { count: "exact", head: true }),
        supabase.from("notices").select("id", { count: "exact", head: true }),
        supabase.from("assignment_status").select("status").eq("student_id", user.id),
        supabase.from("attendance").select("status").eq("student_id", user.id),
        supabase.from("notices").select("*").order("created_at", { ascending: false }).limit(3),
        supabase.from("assignments").select("*").gte("due_date", new Date().toISOString().slice(0, 10)).order("due_date").limit(3),
      ]);
      const total = a.count ?? 0;
      const submittedCount = statuses.data?.filter((s) => s.status === "submitted").length ?? 0;
      const pending = role === "admin" ? total : Math.max(0, total - submittedCount);
      const present = att.data?.filter((r) => r.status === "present").length ?? 0;
      const totalAtt = att.data?.length ?? 0;
      setStats({
        assignments: total,
        pending,
        notices: n.count ?? 0,
        attendance: totalAtt > 0 ? Math.round((present / totalAtt) * 100) : 0,
      });
      setRecentNotices(recent.data ?? []);
      setUpcoming(up.data ?? []);
    })();
  }, [user, role]);

  const cards = [
    { label: "Assignments", value: stats?.assignments, icon: ClipboardList, color: "text-primary" },
    { label: role === "admin" ? "Total Tasks" : "Pending Tasks", value: stats?.pending, icon: FileText, color: "text-warning" },
    { label: "Notices", value: stats?.notices, icon: Megaphone, color: "text-accent-foreground" },
    { label: "Attendance %", value: stats ? `${stats.attendance}%` : undefined, icon: Percent, color: "text-success" },
  ];

  return (
    <div>
      <PageHeader
        title={`Hello, ${fullName?.split(" ")[0] || "there"} 👋`}
        description="Here's a quick overview of your campus activity."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="overflow-hidden border-border/60 shadow-card transition-all hover:shadow-elegant">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
              <div className="mt-2 text-3xl font-bold tracking-tight">
                {c.value === undefined ? <Skeleton className="h-8 w-16" /> : c.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border/60 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Latest notices</CardTitle>
            <Link to="/app/notices" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentNotices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notices yet.</p>
            ) : (
              recentNotices.map((n) => (
                <div key={n.id} className="rounded-lg border bg-card p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    {n.important && <Badge variant="destructive">Important</Badge>}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.content}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Upcoming assignments</CardTitle>
            <Link to="/app/assignments" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing due soon.</p>
            ) : (
              upcoming.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.subject}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(a.due_date), "MMM d")}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}