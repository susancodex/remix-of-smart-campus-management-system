import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Megaphone,
  ClipboardList,
  MoreHorizontal,
  FileText,
  CheckSquare,
  Users as UsersIcon,
  LogOut,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const primary = [
  { title: "Home", url: "/app", icon: LayoutDashboard, end: true },
  { title: "Schedule", url: "/app/timetable", icon: Calendar },
  { title: "Notices", url: "/app/notices", icon: Megaphone },
  { title: "Tasks", url: "/app/assignments", icon: ClipboardList },
];

const overflow = [
  { title: "Notes", url: "/app/notes", icon: FileText },
  { title: "Attendance", url: "/app/attendance", icon: CheckSquare },
];

const adminOverflow = [{ title: "Users", url: "/app/users", icon: UsersIcon }];

export function MobileBottomNav() {
  const location = useLocation();
  const { role, signOut, fullName, user } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const overflowItems = [
    ...overflow,
    ...(role === "admin" ? adminOverflow : []),
  ];

  const isActive = (url: string, end?: boolean) =>
    end ? location.pathname === url : location.pathname.startsWith(url);

  const moreActive = overflowItems.some((i) => isActive(i.url));

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        <ul className="grid grid-cols-5">
          {primary.map((item) => {
            const active = isActive(item.url, item.end);
            return (
              <li key={item.url}>
                <NavLink
                  to={item.url}
                  end={item.end}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-label={item.title}
                >
                  <span
                    className={cn(
                      "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                      active && "bg-primary/10",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="leading-none">{item.title}</span>
                </NavLink>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-label="More"
              aria-expanded={moreOpen}
              className={cn(
                "flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                moreActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                  moreActive && "bg-primary/10",
                )}
              >
                <MoreHorizontal className="h-5 w-5" />
              </span>
              <span className="leading-none">More</span>
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl border-t pb-[calc(env(safe-area-inset-bottom)+1rem)]"
        >
          <SheetHeader className="text-left">
            <SheetTitle className="font-display">More</SheetTitle>
          </SheetHeader>

          <div className="mt-4 rounded-xl border border-border/60 bg-card p-3">
            <p className="truncate text-sm font-medium">
              {fullName || user?.email}
            </p>
            <p className="text-xs capitalize text-muted-foreground">
              {role ?? "—"}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {overflowItems.map((item) => {
              const active = isActive(item.url);
              return (
                <NavLink
                  key={item.url}
                  to={item.url}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-xs font-medium transition-all",
                    active
                      ? "border-primary/40 bg-primary/5 text-primary shadow-sm"
                      : "border-border/60 bg-background text-foreground hover:border-primary/30 hover:bg-accent/40",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </NavLink>
              );
            })}
          </div>

          <button
            type="button"
            onClick={async () => {
              setMoreOpen(false);
              await signOut();
            }}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>

          <button
            type="button"
            onClick={() => setMoreOpen(false)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" /> Close
          </button>
        </SheetContent>
      </Sheet>
    </>
  );
}