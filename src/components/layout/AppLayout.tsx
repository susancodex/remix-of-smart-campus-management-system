import { Outlet, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Shield, GraduationCap as Cap } from "lucide-react";

export default function AppLayout() {
  const { user, loading, role, fullName } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border border-primary/30" />
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Sidebar is hidden on phones — they get the bottom nav instead. */}
        <div className="hidden md:contents">
          <AppSidebar />
        </div>
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl sm:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hidden text-muted-foreground md:inline-flex" />
              <div className="hidden sm:block">
                <p className="text-xs text-muted-foreground">Welcome back</p>
                <p className="text-sm font-semibold leading-none">{fullName?.split(" ")[0] || "Friend"}</p>
              </div>
              <div className="md:hidden">
                <p className="text-xs text-muted-foreground">Welcome back</p>
                <p className="text-sm font-semibold leading-none">{fullName?.split(" ")[0] || "Friend"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Badge
                variant="secondary"
                className="gap-1.5 border border-border/60 bg-accent capitalize text-accent-foreground"
              >
                {role === "admin" ? <Shield className="h-3 w-3" /> : <Cap className="h-3 w-3" />}
                {role}
              </Badge>
            </div>
          </header>
          <main className="relative flex-1 animate-fade-in p-4 pb-24 sm:p-6 md:pb-6 lg:p-8">
            <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-40" />
            <div className="relative">
              <Outlet />
            </div>
          </main>
        </div>
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}