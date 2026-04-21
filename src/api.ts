/* Thin API client + Telegram session helper. */

export type PlanId = "basic" | "pro" | "elite";

export interface PlanFeature { icon: string; text: string }
export interface Plan {
  id: PlanId; label: string; stars: number; period_days: number;
  badge: string | null; features: PlanFeature[];
}
export interface Subscription {
  plan: Plan | null; started_at: string | null; expires_at: string | null;
  days_left: number; active: boolean;
}
export interface Payment {
  id: string; user_id: number; plan_id: string; plan_label: string;
  stars: number; status: "success" | "failed" | "refunded" | "pending";
  telegram_charge_id: string | null; provider_charge_id: string | null;
  created_at: string;
}
export interface Channel {
  id: string; name: string; handle: string; description: string;
  plan: string; invite_link: string; members: number; active: boolean;
  created_at: string;
}
export interface UserOut {
  id: number; tg_id: number; username: string | null;
  first_name: string | null; last_name: string | null; is_admin: boolean;
}

const BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "http://localhost:8000";
const TOKEN_KEY = "tg_stars_jwt";

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> | undefined),
  };
  const t = getToken();
  if (t) headers["Authorization"] = `Bearer ${t}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${await res.text()}`);
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
  me:                () => request<UserOut>("/api/auth/me"),
  getPlans:          () => request<Plan[]>("/api/plans"),
  getMySubscription: () => request<Subscription>("/api/me/subscription"),
  getMyPayments:     () => request<Payment[]>("/api/me/payments"),
  getMyChannels:     () => request<Channel[]>("/api/me/channels"),
  createInvoice:     (plan_id: PlanId) =>
    request<{ invoice_link: string; plan_id: string; stars: number; payload: string }>(
      "/api/payments/invoice", { method: "POST", body: JSON.stringify({ plan_id }) }),
};
