import { useEffect, useMemo, useState } from "react";
import { Search, Shield, ShieldOff, UserCircle2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  role: "admin" | "student";
}

export default function Users() {
  const { role, user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, created_at"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (pErr || rErr) {
      toast.error(pErr?.message || rErr?.message || "Failed to load users");
      setLoading(false);
      return;
    }
    const roleMap = new Map<string, "admin" | "student">();
    roles?.forEach((r: any) => {
      // If a user has both, prefer admin
      const existing = roleMap.get(r.user_id);
      if (existing === "admin") return;
      roleMap.set(r.user_id, r.role);
    });
    const merged: UserRow[] = (profiles ?? []).map((p: any) => ({
      id: p.id,
      full_name: p.full_name || "",
      email: p.email,
      created_at: p.created_at,
      role: roleMap.get(p.id) ?? "student",
    }));
    merged.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    setRows(merged);
    setLoading(false);
  };

  useEffect(() => {
    if (role === "admin") load();
  }, [role]);

  const filtered = useMemo(
    () =>
      rows.filter((r) =>
        [r.full_name, r.email, r.role].some((s) => s.toLowerCase().includes(search.toLowerCase())),
      ),
    [rows, search],
  );

  const adminCount = rows.filter((r) => r.role === "admin").length;

  const promote = async (target: UserRow) => {
    setBusyId(target.id);
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: target.id, role: "admin" });
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success(`${target.full_name || target.email} is now an admin`);
    load();
  };

  const demote = async (target: UserRow) => {
    setBusyId(target.id);
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", target.id)
      .eq("role", "admin");
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success(`${target.full_name || target.email} is now a student`);
    load();
  };

  if (!authLoading && role !== "admin") return <Navigate to="/app" replace />;

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage who has admin access to the campus."
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="border-border/60 shadow-card">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Total users</p>
            <p className="mt-1 text-2xl font-bold">{rows.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-card">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Admins</p>
            <p className="mt-1 text-2xl font-bold">{adminCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-card">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Students</p>
            <p className="mt-1 text-2xl font-bold">{rows.length - adminCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name, email or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="border-border/60 shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <>
                  {[1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                filtered.map((row) => {
                  const isSelf = row.id === user?.id;
                  const isLastAdmin = row.role === "admin" && adminCount <= 1;
                  const isAdminRow = row.role === "admin";
                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                            <UserCircle2 className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {row.full_name || "—"}
                              {isSelf && (
                                <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={isAdminRow ? "default" : "secondary"}
                          className={isAdminRow ? "gap-1" : "gap-1"}
                        >
                          {isAdminRow ? <Shield className="h-3 w-3" /> : <UserCircle2 className="h-3 w-3" />}
                          <span className="capitalize">{row.role}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(row.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        {isAdminRow ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="gap-1 text-destructive hover:text-destructive"
                                disabled={busyId === row.id || isSelf || isLastAdmin}
                                title={
                                  isSelf
                                    ? "You can't demote yourself"
                                    : isLastAdmin
                                      ? "At least one admin is required"
                                      : ""
                                }
                              >
                                <ShieldOff className="h-4 w-4" /> Demote
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Demote to student?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {row.full_name || row.email} will lose admin access immediately.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => demote(row)}>
                                  Demote
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" className="gap-1" disabled={busyId === row.id}>
                                <Shield className="h-4 w-4" /> Promote
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Promote to admin?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {row.full_name || row.email} will be able to manage timetable,
                                  notices, notes, assignments, attendance and other users.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => promote(row)}>
                                  Promote
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="mt-3 text-xs text-muted-foreground">
        You can't demote yourself or remove the last admin to avoid getting locked out.
      </p>
    </div>
  );
}