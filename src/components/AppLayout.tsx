import { useState, type ReactNode } from "react";
import { Bell, Menu, Search, Sun, Moon } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { ResponsibleAIBar } from "./ResponsibleAIBar";
import { Sheet, SheetContent, SheetTitle } from "./ui/sheet";
import { useSettings } from "../lib/settings";

export function AppLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { settings, update } = useSettings();
  const isDark = settings.theme === "dark";

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 border-r border-border bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <AppSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="grid size-9 place-items-center rounded-md border border-border text-text-muted hover:bg-surface-hover hover:text-foreground lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>

          <div className="relative hidden flex-1 sm:block sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search workspace…"
              className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 text-xs text-text-muted md:flex">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              AI Ready
            </div>
            <button
              type="button"
              onClick={() => update({ theme: isDark ? "light" : "dark" })}
              className="grid size-9 place-items-center rounded-md border border-border text-text-muted hover:bg-surface-hover hover:text-foreground"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <button
              type="button"
              className="grid size-9 place-items-center rounded-md border border-border text-text-muted hover:bg-surface-hover hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
            </button>
            <div
              className="grid size-9 place-items-center rounded-full bg-surface-hover text-xs font-semibold text-foreground"
              aria-label="Profile"
            >
              AR
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>

        <ResponsibleAIBar />
      </div>
    </div>
  );
}
