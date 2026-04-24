import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Profile { id: string; full_name: string; email: string }
interface Record { id: string; student_id: string; subject: string; status: "present" | "absent"; date: string }

export default function Attendance() {
  const { role, user } = useAuth();
  const isAdmin = role === "admin";
  const [records, setRecords] = useState<Record[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ student_id: "", subject: "", status: "present" as "present" | "absent", date: new Date().toISOString().slice(0, 10) });
  const [search, setSearch] = useState("");

  const load = async () => {
    const q = supabase.from("attendance").select("*").order("date", { ascending: false });
    const { data } = await q;
    setRecords((data ?? []) as Record[]);
    if (isAdmin) {
      const { data: ps } = await supabase.from("profiles").select("id, full_name, email");
      setStudents(ps ?? []);
    }
  };
  useEffect(() => { load(); }, [isAdmin]);

  const studentMap = useMemo(() => {
    const m: Record<string, Profile> = {} as any;
    students.forEach((s) => { m[s.id] = s; });
    return m;
  }, [students]);

  const myRecords = useMemo(() => user ? records.filter((r) => r.student_id === user.id) : [], [records, user]);

  const subjects = useMemo(() => Array.from(new Set(myRecords.map((r) => r.subject))), [myRecords]);
  const subjectStats = subjects.map((sub) => {
    const rs = myRecords.filter((r) => r.subject === sub);
    const present = rs.filter((r) => r.status === "present").length;
    const pct = rs.length ? Math.round((present / rs.length) * 100) : 0;
    return { subject: sub, total: rs.length, present, pct };
  });
  const overall = myRecords.length ? Math.round((myRecords.filter((r) => r.status === "present").length / myRecords.length) * 100) : 0;

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id || !form.subject) return toast.error("Choose student and subject");
    const { error } = await supabase.from("attendance").insert({ ...form, marked_by: user!.id });
    if (error) return toast.error(error.message);
    toast.success("Attendance marked");
    setOpen(false);
    setForm({ ...form, student_id: "", subject: "" });
    load();
  };

  const adminFiltered = records.filter((r) => {
    const s = studentMap[r.student_id];
    return [s?.full_name ?? "", s?.email ?? "", r.subject].some((x) => x.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div>
      <PageHeader
        title="Attendance"
        description={isAdmin ? "Mark and review student attendance." : "Your attendance overview."}
        actions={
          isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" /> Mark attendance</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Mark attendance</DialogTitle></DialogHeader>
                <form onSubmit={add} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Student</Label>
                    <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                      <SelectContent>
                        {students.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name || s.email}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required maxLength={100} /></div>
                    <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v: "present" | "absent") => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter><Button type="submit">Save</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
      />

      {!isAdmin && (
        <>
          <Card className="mb-6 border-border/60 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall attendance</p>
                  <p className="mt-1 text-4xl font-bold tracking-tight">{overall}%</p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {myRecords.filter((r) => r.status === "present").length} / {myRecords.length} classes
                </div>
              </div>
              <Progress value={overall} className="mt-4" />
            </CardContent>
          </Card>

          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Subject-wise</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subjectStats.length === 0 && <p className="text-sm text-muted-foreground">No attendance recorded yet.</p>}
            {subjectStats.map((s) => (
              <Card key={s.subject} className="border-border/60 shadow-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{s.subject}</p>
                    <span className={`text-sm font-semibold ${s.pct >= 75 ? "text-success" : "text-destructive"}`}>{s.pct}%</span>
                  </div>
                  <Progress value={s.pct} className="mt-3" />
                  <p className="mt-2 text-xs text-muted-foreground">{s.present} present of {s.total}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {isAdmin && (
        <>
          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by student or subject..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Card className="border-border/60 shadow-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminFiltered.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground">No records</TableCell></TableRow>
                  )}
                  {adminFiltered.map((r) => {
                    const s = studentMap[r.student_id];
                    return (
                      <TableRow key={r.id}>
                        <TableCell>{s?.full_name || s?.email || "—"}</TableCell>
                        <TableCell>{r.subject}</TableCell>
                        <TableCell>{format(new Date(r.date), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <Badge className={r.status === "present" ? "bg-success text-success-foreground hover:bg-success" : ""} variant={r.status === "absent" ? "destructive" : "default"}>
                            {r.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}