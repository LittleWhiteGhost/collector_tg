import { useEffect, useState, type ReactNode } from "react";
import {
  Sparkles, User as UserIcon, LayoutDashboard, Radio,
  Star, UsersRound, Receipt, Hash, Tag, Menu, X,
} from "lucide-react";
import type { UserOut } from "../api";

export type Page =
  | "welcome"
  | "plans"
  | "channels"
  | "profile"
  | "success"
  | "error"
  | "admin:dashboard"
  | "admin:channels"
  | "admin:plans"
  | "admin:users"
  | "admin:payments"
  | "admin:promo";

type NavItem = { id: Page; label: string; icon: typeof Sparkles; adminOnly?: boolean; group: "main" | "admin" };

const NAV: NavItem[] = [
  { id: "plans",            label: "Plans",     icon: Sparkles,        group: "main" },
  { id: "channels",         label: "Channels",  icon: Hash,            group: "main" },
  { id: "profile",          label: "Profile",   icon: UserIcon,        group: "main" },
  { id: "admin:dashboard",  label: "Dashboard", icon: LayoutDashboard, adminOnly: true, group: "admin" },
  { id: "admin:channels",   label: "Manage",    icon: Radio,           adminOnly: true, group: "admin" },
  { id: "admin:plans",      label: "Tariffs",   icon: Star,            adminOnly: true, group: "admin" },
  { id: "admin:users",      label: "Users",     icon: UsersRound,      adminOnly: true, group: "admin" },
  { id: "admin:payments",   label: "Payments",  icon: Receipt,         adminOnly: true, group: "admin" },
  { id: "admin:promo",      label: "Promo",     icon: Tag,             adminOnly: true, group: "admin" },
];

interface Props {
  user: UserOut | null;
  page: Page;
  onNavigate: (p: Page) => void;
  children: ReactNode;
}

export default function Shell({ user, page, onNavigate, children }: Props) {
  const isAdmin = !!user?.is_admin;
  const mainItems = NAV.filter(n => n.group === "main");
  const adminItems = NAV.filter(n => n.group === "admin");
  const [open, setOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleNav = (p: Page) => {
    onNavigate(p);
    setOpen(false);
  };

  return (
    <div className="glow-bg min-h-screen w-full text-ink-50 relative">
      {/* Main */}
      <main className="pb-28">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10">
          <div key={page} className="page-enter">
            {children}
          </div>
        </div>
      </main>

      {/* Floating nav — fixed, bottom-right corner, collapsible */}
      <div
        className="fixed z-40 flex flex-col items-end gap-2"
        style={{
          right: "max(env(safe-area-inset-right), 12px)",
          bottom: "max(env(safe-area-inset-bottom), 12px)",
        }}
      >
        {/* Rail (expanded items) */}
        {open && (
          <nav
            aria-label="Primary"
            className="rail-expand flex flex-col items-center gap-1.5
                       rounded-full border border-white/10
                       bg-black/70 backdrop-blur-xl
                       px-1.5 py-2
                       shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]"
          >
            {mainItems.map(item => (
              <RailButton
                key={item.id}
                item={item}
                active={page === item.id}
                onClick={() => handleNav(item.id)}
              />
            ))}

            {isAdmin && (
              <>
                <div className="my-1 h-px w-6 bg-white/10" aria-hidden="true" />
                {adminItems.map(item => (
                  <RailButton
                    key={item.id}
                    item={item}
                    active={page === item.id}
                    onClick={() => handleNav(item.id)}
                  />
                ))}
              </>
            )}
          </nav>
        )}

        {/* Toggle FAB */}
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className={`h-12 w-12 rounded-full grid place-items-center
                      border border-white/10
                      shadow-[0_10px_30px_-8px_rgba(0,0,0,0.8)]
                      transition active:scale-95
                      ${open
                        ? "bg-black/80 backdrop-blur-xl text-white"
                        : "bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-brand-500/40 hover:scale-105"}`}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

function RailButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={`group relative h-9 w-9 rounded-full grid place-items-center transition
        ${active
          ? "bg-gradient-to-br from-brand-500/30 to-brand-700/10 text-white ring-1 ring-brand-500/40"
          : "text-ink-300 hover:text-white hover:bg-white/10"}`}
    >
      <Icon className={`h-[18px] w-[18px] ${active ? "text-brand-300" : ""}`} />
      {/* Tooltip — appears to the LEFT on hover/focus (rail is on the right) */}
      <span
        role="tooltip"
        className="pointer-events-none absolute right-[calc(100%+10px)] top-1/2 -translate-y-1/2
                   whitespace-nowrap rounded-lg border border-white/10 bg-black/90 backdrop-blur-md
                   px-2.5 py-1 text-[11px] font-semibold tracking-widest uppercase text-white
                   opacity-0 translate-x-[4px] transition
                   group-hover:opacity-100 group-hover:translate-x-0
                   group-focus-visible:opacity-100 group-focus-visible:translate-x-0
                   shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
      >
        {item.label}
      </span>
    </button>
  );
}
