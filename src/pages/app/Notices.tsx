import { useEffect, useState } from "react";
import { Plus, Trash2, Search, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const PAGE_SIZE = 6;

export default function Notices() {
  const { role, user } = useAuth();
  const isAdmin = role === "admin";
  const [list, setList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", important: false });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = async () => {
    const { data } = await supabase.from("notices").select("*").order("created_at", { ascending: false });
    setList(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const filtered = list.filter((n) =>
    [n.title, n.content].some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return toast.error("Title and content required");
    const { error } = await supabase.from("notices").insert({ ...form, created_by: user!.id });
    if (error) return toast.error(error.message);
    toast.success("Notice posted");
    setOpen(false);
    setForm({ title: "", content: "", important: false });
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("notices").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div>
      <PageHeader
        title="Notice Board"
        description="Latest announcements from your campus."
        actions={
          isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" /> New notice</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Post a notice</DialogTitle></DialogHeader>
                <form onSubmit={add} className="space-y-3">
                  <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={200} /></div>
                  <div className="space-y-1.5"><Label>Content</Label><Textarea rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required maxLength={2000} /></div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div><p className="text-sm font-medium">Mark as important</p><p className="text-xs text-muted-foreground">Highlights for all students.</p></div>
                    <Switch checked={form.important} onCheckedChange={(v) => setForm({ ...form, important: v })} />
                  </div>
                  <DialogFooter><Button type="submit">Publish</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
      />

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search notices..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {pageItems.length === 0 && (
          <p className="text-sm text-muted-foreground">No notices found.</p>
        )}
        {pageItems.map((n) => (
          <Card key={n.id} className={`border-border/60 shadow-card ${n.important ? "ring-1 ring-destructive/40" : ""}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {n.important && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    <h3 className="truncate font-semibold">{n.title}</h3>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {format(new Date(n.created_at), "MMM d, yyyy • h:mm a")}
                  </p>
                </div>
                {n.important && <Badge variant="destructive">Important</Badge>}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/90">{n.content}</p>
              {isAdmin && (
                <Button size="sm" variant="ghost" className="mt-3 h-8 gap-1 text-destructive" onClick={() => remove(n.id)}>
                  <Trash2 className="h-3 w-3" /> Delete
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage(Math.max(1, page - 1)); }} />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink href="#" isActive={page === i + 1} onClick={(e) => { e.preventDefault(); setPage(i + 1); }}>{i + 1}</PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage(Math.min(totalPages, page + 1)); }} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}