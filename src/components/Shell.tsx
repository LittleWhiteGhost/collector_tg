import type { ReactNode } from "react";
import {
  Sparkles, User as UserIcon, LayoutDashboard, Radio,
  Star, UsersRound, Receipt, Shield, ExternalLink,
} from "lucide-react";
import type { UserOut } from "../api";
import { API_BASE } from "../api";

export type Page =
  | "welcome"
  | "plans"
  | "profile"
  | "success"
  | "error"
  | "admin:dashboard"
  | "admin:channels"
  | "admin:plans"
  | "admin:users"
  | "admin:payments";

type NavItem = { id: Page; label: string; icon: typeof Sparkles; adminOnly?: boolean; group?: string };

const NAV: NavItem[] = [
  { id: "plans",            label: "Plans",     icon: Sparkles,        group: "main" },
  { id: "profile",          label: "Profile",   icon: UserIcon,        group: "main" },
  { id: "admin:dashboard",  label: "Dashboard", icon: LayoutDashboard, adminOnly: true, group: "admin" },
  { id: "admin:channels",   label: "Channels",  icon: Radio,           adminOnly: true, group: "admin" },
  { id: "admin:plans",      label: "Tariffs",   icon: Star,            adminOnly: true, group: "admin" },
  { id: "admin:users",      label: "Users",     icon: UsersRound,      adminOnly: true, group: "admin" },
  { id: "admin:payments",   label: "Payments",  icon: Receipt,         adminOnly: true, group: "admin" },
];

const MOBILE_NAV_ORDER: Page[] = ["plans", "profile"];
const MOBILE_ADMIN_ORDER: Page[] = ["admin:dashboard", "admin:channels", "admin:plans"];

interface Props {
  user: UserOut | null;
  page: Page;
  onNavigate: (p: Page) => void;
  children: ReactNode;
}

export default function Shell({ user, page, onNavigate, children }: Props) {
  const isAdmin = !!user?.is_admin;
  const visibleNav = NAV.filter(n => !n.adminOnly || isAdmin);
  const mobileIds: Page[] = [...MOBILE_NAV_ORDER, ...(isAdmin ? MOBILE_ADMIN_ORDER : [])];

  return (
    <div className="glow-bg min-h-screen w-full text-ink-50">
      <div className="flex min-h-screen">
        {/* Sidebar — tablet+ */}
        <aside className="hidden sm:flex sticky top-0 h-screen flex-col gap-2 border-r border-white/5 bg-black/40 backdrop-blur-xl px-3 lg:px-5 py-6 shrink-0 w-16 lg:w-64">
          <button
            onClick={() => onNavigate("plans")}
            className="flex items-center gap-2 mb-5 px-2"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 grid place-items-center shadow-lg shadow-brand-500/30">
              <Star className="h-5 w-5 fill-white" />
            </div>
            <span className="hidden lg:block font-bold tracking-widest text-[13px]">TG · STARS</span>
          </button>
          <div className="flex flex-col gap-1">
            {visibleNav.filter(n => n.group === "main").map(item => (
              <NavButton key={item.id} item={item} active={page === item.id} onClick={() => onNavigate(item.id)} />
            ))}
          </div>
          {isAdmin && (
            <>
              <div className="mt-4 mb-1 px-2 hidden lg:flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-brand-500" />
                <span className="text-[10px] tracking-[0.25em] text-ink-300">ADMIN</span>
              </div>
              <div className="flex flex-col gap-1">
                {visibleNav.filter(n => n.group === "admin").map(item => (
                  <NavButton key={item.id} item={item} active={page === item.id} onClick={() => onNavigate(item.id)} />
                ))}
              </div>
            </>
          )}
          <div className="mt-auto pt-4 border-t border-white/5 text-[10px] text-ink-300 space-y-1 hidden lg:block">
            <p className="truncate">{user?.username ? `@${user.username}` : user?.first_name ?? "Anonymous"}</p>
            <a
              href={`${API_BASE}/admin/`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-brand-300 transition"
            >
              Open web admin <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 pb-24 sm:pb-10">
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed sm:hidden bottom-0 inset-x-0 z-40 border-t border-white/10 bg-black/80 backdrop-blur-xl px-2 pt-2 pb-[max(env(safe-area-inset-bottom),8px)]">
        <div className="grid grid-flow-col auto-cols-fr gap-1">
          {mobileIds.map(id => {
            const item = NAV.find(n => n.id === id); if (!item) return null;
            const Icon = item.icon;
            const active = page === id;
            return (
              <button key={id} onClick={() => onNavigate(id)}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl transition ${active ? "text-brand-400" : "text-ink-300"}`}>
                <Icon className={`h-5 w-5 ${active ? "text-brand-500" : ""}`} />
                <span className="text-[10px] tracking-widest uppercase font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition
        ${active
          ? "bg-gradient-to-r from-brand-500/20 to-brand-700/5 text-white"
          : "text-ink-300 hover:text-white hover:bg-white/5"}`}
      title={item.label}
    >
      <span className={`absolute inset-y-1 left-0 w-[3px] rounded-r-full transition ${active ? "bg-brand-500" : "bg-transparent"}`} />
      <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-brand-400" : ""}`} />
      <span className="hidden lg:block text-[13px] font-medium tracking-wide">{item.label}</span>
    </button>
  );
}
