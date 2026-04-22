/* Thin API client + Telegram session helper. */

export type PlanId = string;

export interface PlanFeature { icon: string; text: string }
export interface Plan {
  id: PlanId; label: string; stars: number; period_days: number;
  badge: string | null; features: PlanFeature[];
  order_index?: number; active?: boolean;
}
export interface Subscription {
  plan: Plan | null; started_at: string | null; expires_at: string | null;
  days_left: number; active: boolean;
}
export interface Payment {
  id: string; plan_id: string; plan_label: string;
  stars: number; status: "success" | "failed" | "refunded" | "pending";
  created_at: string;
}
export interface Channel {
  id: string; name: string; handle: string; description: string;
  plan: string; invite_link: string; members: number; active: boolean;
  created_at: string;
}
export interface PublicChannel {
  id: string; name: string; handle: string; description: string;
  plan: string; members: number;
}
export interface UserOut {
  id: number; tg_id: number; username: string | null;
  first_name: string | null; last_name: string | null; is_admin: boolean;
}

// ── admin types ──
export interface AdminUser {
  id: number; tg_id: number; username: string | null;
  plan: string | null; since: string | null; expires_at: string | null;
  active: boolean; stars_spent: number;
}
export interface PlanBreakdown { basic: number; pro: number; elite: number; all: number }
export interface ChannelPerfRow { id: string; name: string; plan: string; members: number; active: boolean }
export interface StatsOverview {
  total_channels: number; active_channels: number; total_members: number;
  est_monthly_stars: number; plan_breakdown: PlanBreakdown;
  channel_performance: ChannelPerfRow[]; revenue_by_plan: Record<string, number>;
}
export interface WeeklyPoint { day: string; stars: number; date: string }
export interface RecentActivity { at: string; kind: string; text: string }
export interface StatsAnalytics {
  weekly_trend: WeeklyPoint[]; total_weekly_stars: number; best_day: WeeklyPoint | null;
  total_revenue_all_time: number; new_subs_this_week: number;
  conversion_rate: number; churn_rate: number; avg_rev_per_user: number;
  plan_conversion_funnel: Record<string, number>; recent_activity: RecentActivity[];
}

export interface ChannelIn {
  name: string; handle: string; description?: string;
  plan: "basic" | "pro" | "elite" | "all"; invite_link?: string; active?: boolean;
}
export interface ChannelPatch { name?: string; handle?: string; description?: string;
  plan?: "basic" | "pro" | "elite" | "all"; invite_link?: string; active?: boolean }

export interface PlanIn {
  id: string; label: string; stars: number; period_days?: number;
  badge?: string | null; features?: PlanFeature[]; order_index?: number; active?: boolean;
}
export interface PlanPatch {
  label?: string; stars?: number; period_days?: number; badge?: string | null;
  features?: PlanFeature[]; order_index?: number; active?: boolean;
}

// Default backend URL. Override via VITE_API_BASE env var during build if you move backend.
const BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "https://tg-stars-backend.onrender.com";
export const API_BASE = BASE;
const TOKEN_KEY = "tg_stars_jwt";

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> | undefined),
  };
  const t = getToken();
  if (t) headers["Authorization"] = `Bearer ${t}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${await res.text()}`);
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export async function initSession(): Promise<UserOut | null> {
  try {
    const tg = (window as unknown as { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp;
    const init_data = tg?.initData ?? "";
    const res = await fetch(`${BASE}/api/auth/telegram`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ init_data }),
    });
    if (!res.ok) return null;
    const data: { token: string; user: UserOut } = await res.json();
    setToken(data.token);
    return data.user;
  } catch { return null; }
}

export const api = {
  // user
  me:                () => request<UserOut>("/api/auth/me"),
  getPlans:          () => request<Plan[]>("/api/plans"),
  getPublicChannels: () => request<PublicChannel[]>("/api/channels"),
  getMySubscription: () => request<Subscription>("/api/me/subscription"),
  getMyPayments:     () => request<Payment[]>("/api/me/payments"),
  getMyChannels:     () => request<Channel[]>("/api/me/channels"),
  createInvoice:     (plan_id: PlanId) =>
    request<{ invoice_link: string; plan_id: string; stars: number; payload: string }>(
      "/api/payments/invoice", { method: "POST", body: JSON.stringify({ plan_id }) }),

  // admin — channels
  adminListChannels:  () => request<Channel[]>("/api/admin/channels"),
  adminCreateChannel: (data: ChannelIn) =>
    request<Channel>("/api/admin/channels", { method: "POST", body: JSON.stringify(data) }),
  adminUpdateChannel: (id: string, data: ChannelPatch) =>
    request<Channel>(`/api/admin/channels/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(data) }),
  adminToggleChannel: (id: string) =>
    request<Channel>(`/api/admin/channels/${encodeURIComponent(id)}/toggle`, { method: "PATCH" }),
  adminDeleteChannel: (id: string) =>
    request<{ ok: boolean }>(`/api/admin/channels/${encodeURIComponent(id)}`, { method: "DELETE" }),

  // admin — plans
  adminListPlans:     () => request<Plan[]>("/api/admin/plans"),
  adminCreatePlan:    (data: PlanIn) =>
    request<Plan>("/api/admin/plans", { method: "POST", body: JSON.stringify(data) }),
  adminUpdatePlan:    (id: string, data: PlanPatch) =>
    request<Plan>(`/api/admin/plans/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(data) }),
  adminTogglePlan:    (id: string) =>
    request<Plan>(`/api/admin/plans/${encodeURIComponent(id)}/toggle`, { method: "PATCH" }),
  adminDeletePlan:    (id: string) =>
    request<{ ok: boolean }>(`/api/admin/plans/${encodeURIComponent(id)}`, { method: "DELETE" }),

  // admin — users / stats / payments
  adminListUsers:     (plan = "all") =>
    request<AdminUser[]>(`/api/admin/users?plan=${encodeURIComponent(plan)}`),
  adminOverview:      () => request<StatsOverview>("/api/admin/stats/overview"),
  adminAnalytics:     () => request<StatsAnalytics>("/api/admin/stats/analytics"),
  adminPayments:      () => request<(Payment & { user_id: number })[]>("/api/admin/payments"),
};
