import { useEffect, useState } from "react";
import { Plus, Trash2, Calendar, Clock, MapPin, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Slot {
  id: string;
  subject: string;
  day: string;
  start_time: string;
  end_time: string;
  teacher: string;
  room: string | null;
}

export default function Timetable() {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [slots, setSlots] = useState<Slot[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subject: "", day: "Monday", start_time: "09:00", end_time: "10:00", teacher: "", room: "" });

  const load = async () => {
    const { data } = await supabase.from("timetable").select("*").order("start_time");
    setSlots(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.teacher) return toast.error("Subject and teacher required");
    const { error } = await supabase.from("timetable").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Class added");
    setOpen(false);
    setForm({ subject: "", day: "Monday", start_time: "09:00", end_time: "10:00", teacher: "", room: "" });
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("timetable").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    load();
  };

  return (
    <div>
      <PageHeader
        title="Timetable"
        description="Your weekly class schedule at a glance."
        icon={<Calendar className="h-6 w-6" />}
        actions={
          isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-glow"><Plus className="h-4 w-4" /> Add class</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add class</DialogTitle></DialogHeader>
                <form onSubmit={add} className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5"><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required /></div>
                    <div className="space-y-1.5"><Label>Teacher</Label><Input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} required /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="col-span-2 space-y-1.5 sm:col-span-1">
                      <Label>Day</Label>
                      <Select value={form.day} onValueChange={(v) => setForm({ ...form, day: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label>Start</Label><Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></div>
                    <div className="space-y-1.5"><Label>End</Label><Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></div>
                  </div>
                  <div className="space-y-1.5"><Label>Room (optional)</Label><Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></div>
                  <DialogFooter><Button type="submit">Add class</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {DAYS.map((day) => {
          const items = slots.filter((s) => s.day === day);
          return (
            <Card key={day} className="border-border/60 shadow-card transition-shadow hover:shadow-glow">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-1 rounded-full bg-gradient-vivid" />
                    <h3 className="font-display text-lg font-bold">{day}</h3>
                  </div>
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                    {items.length} {items.length === 1 ? "class" : "classes"}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.length === 0 && (
                    <p className="rounded-lg border border-dashed border-border/60 py-6 text-center text-xs text-muted-foreground">
                      No classes scheduled
                    </p>
                  )}
                  {items.map((s) => (
                    <div key={s.id} className="group rounded-xl border border-border/60 bg-card p-3 transition-all hover:border-primary/40 hover:bg-accent/30 hover:shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{s.subject}</p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{s.teacher}</span>
                            {s.room && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{s.room}</span>}
                          </div>
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-gradient-vivid px-2 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm">
                          <Clock className="h-3 w-3" />
                          {s.start_time.slice(0,5)}–{s.end_time.slice(0,5)}
                        </span>
                      </div>
                      {isAdmin && (
                        <Button size="sm" variant="ghost" className="mt-2 h-7 gap-1 text-destructive opacity-0 transition-opacity group-hover:opacity-100" onClick={() => remove(s.id)}>
                          <Trash2 className="h-3 w-3" /> Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}