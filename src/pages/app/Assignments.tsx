import { useEffect, useState } from "react";
import { Plus, Trash2, Search, Calendar as CalendarIcon, CheckCircle2, Clock } from "lucide-react";
import { format, isBefore, startOfToday } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function Assignments() {
  const { role, user } = useAuth();
  const isAdmin = role === "admin";
  const [list, setList] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", subject: "", due_date: "" });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "submitted">("all");

  const load = async () => {
    const { data: assignments } = await supabase.from("assignments").select("*").order("due_date");
    setList(assignments ?? []);
    if (user) {
      const { data: ss } = await supabase.from("assignment_status").select("*").eq("student_id", user.id);
      const map: Record<string, string> = {};
      ss?.forEach((s) => { map[s.assignment_id] = s.status; });
      setStatuses(map);
    }
  };
  useEffect(() => { load(); }, [user]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.subject || !form.due_date) return toast.error("Fill required fields");
    const { error } = await supabase.from("assignments").insert({ ...form, created_by: user!.id });
    if (error) return toast.error(error.message);
    toast.success("Assignment created");
    setOpen(false);
    setForm({ title: "", description: "", subject: "", due_date: "" });
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("assignments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const toggleStatus = async (assignmentId: string) => {
    if (!user) return;
    const current = statuses[assignmentId] ?? "pending";
    const next = current === "submitted" ? "pending" : "submitted";
    const { error } = await supabase
      .from("assignment_status")
      .upsert({ assignment_id: assignmentId, student_id: user.id, status: next }, { onConflict: "assignment_id,student_id" });
    if (error) return toast.error(error.message);
    setStatuses({ ...statuses, [assignmentId]: next });
    toast.success(next === "submitted" ? "Marked submitted" : "Marked pending");
  };

  const filtered = list.filter((a) => {
    const matches = [a.title, a.subject, a.description ?? ""].some((s) => s.toLowerCase().includes(search.toLowerCase()));
    if (!matches) return false;
    if (filter === "all" || isAdmin) return true;
    const status = statuses[a.id] ?? "pending";
    return status === filter;
  });

  return (
    <div>
      <PageHeader
        title="Assignments"
        description={isAdmin ? "Create and manage assignments." : "Track and submit your work."}
        actions={
          isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" /> New assignment</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New assignment</DialogTitle></DialogHeader>
                <form onSubmit={add} className="space-y-3">
                  <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={200} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required maxLength={100} /></div>
                    <div className="space-y-1.5"><Label>Due date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} required /></div>
                  </div>
                  <div className="space-y-1.5"><Label>Description</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={1000} /></div>
                  <DialogFooter><Button type="submit">Create</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search assignments..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {!isAdmin && (
          <div className="flex gap-1 rounded-lg border bg-card p-1">
            {(["all", "pending", "submitted"] as const).map((f) => (
              <Button key={f} size="sm" variant={filter === f ? "default" : "ghost"} className="capitalize" onClick={() => setFilter(f)}>{f}</Button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No assignments.</p>}
        {filtered.map((a) => {
          const status = statuses[a.id] ?? "pending";
          const overdue = isBefore(new Date(a.due_date), startOfToday()) && status !== "submitted";
          return (
            <Card key={a.id} className="border-border/60 shadow-card">
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{a.title}</h3>
                    <Badge variant="secondary">{a.subject}</Badge>
                    {!isAdmin && (
                      <Badge variant={status === "submitted" ? "default" : "outline"} className={status === "submitted" ? "bg-success text-success-foreground hover:bg-success" : ""}>
                        {status === "submitted" ? <><CheckCircle2 className="mr-1 h-3 w-3" /> Submitted</> : <><Clock className="mr-1 h-3 w-3" /> Pending</>}
                      </Badge>
                    )}
                    {overdue && <Badge variant="destructive">Overdue</Badge>}
                  </div>
                  {a.description && <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>}
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarIcon className="h-3 w-3" /> Due {format(new Date(a.due_date), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {!isAdmin && (
                    <Button size="sm" variant={status === "submitted" ? "outline" : "default"} onClick={() => toggleStatus(a.id)}>
                      {status === "submitted" ? "Mark pending" : "Mark submitted"}
                    </Button>
                  )}
                  {isAdmin && (
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(a.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}