import { useEffect, useState } from "react";
import { Plus, Download, Trash2, Search, FileText, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function Notes() {
  const { role, user } = useAuth();
  const isAdmin = role === "admin";
  const [list, setList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "", description: "" });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const load = async () => {
    const { data } = await supabase.from("notes").select("*").order("created_at", { ascending: false });
    setList(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const subjects = Array.from(new Set(list.map((n) => n.subject)));
  const filtered = list.filter((n) => {
    const matchesSearch = [n.title, n.subject, n.description ?? ""].some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchesSubject = subjectFilter === "all" || n.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Choose a file");
    if (!form.title || !form.subject) return toast.error("Title and subject required");
    setUploading(true);
    const path = `${user!.id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("notes").upload(path, file);
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    const { error } = await supabase.from("notes").insert({ ...form, file_path: path, uploaded_by: user!.id });
    setUploading(false);
    if (error) return toast.error(error.message);
    toast.success("Note uploaded");
    setOpen(false);
    setForm({ title: "", subject: "", description: "" });
    setFile(null);
    load();
  };

  const download = async (path: string, title: string) => {
    const { data, error } = await supabase.storage.from("notes").createSignedUrl(path, 60);
    if (error || !data) return toast.error("Could not generate download link");
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = title;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const remove = async (id: string, path: string) => {
    await supabase.storage.from("notes").remove([path]);
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div>
      <PageHeader
        title="Notes"
        description="Study materials shared by faculty."
        icon={<FileText className="h-6 w-6" />}
        actions={
          isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-glow"><Plus className="h-4 w-4" /> Upload note</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Upload note</DialogTitle></DialogHeader>
                <form onSubmit={add} className="space-y-3">
                  <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={200} /></div>
                  <div className="space-y-1.5"><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required maxLength={100} /></div>
                  <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={500} /></div>
                  <div className="space-y-1.5"><Label>File (PDF/DOC)</Label><Input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required /></div>
                  <DialogFooter><Button type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Upload"}</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-11 pl-9" placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="h-11 sm:w-56"><SelectValue placeholder="All subjects" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border/60 py-16 text-center">
            <Inbox className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">No notes available.</p>
          </div>
        )}
        {filtered.map((n) => (
          <Card key={n.id} className="group border-border/60 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-glow">
            <CardContent className="p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-vivid text-primary-foreground shadow-glow transition-transform group-hover:scale-105">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="line-clamp-1 font-display text-base font-semibold">{n.title}</h3>
              </div>
              <Badge variant="secondary" className="mt-1">{n.subject}</Badge>
              {n.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{n.description}</p>}
              <div className="mt-4 flex gap-2">
                <Button size="sm" className="gap-1" onClick={() => download(n.file_path, n.title)}>
                  <Download className="h-3 w-3" /> Download
                </Button>
                {isAdmin && (
                  <Button size="sm" variant="ghost" className="gap-1 text-destructive" onClick={() => remove(n.id, n.file_path)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}