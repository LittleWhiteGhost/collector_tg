/* TG Stars Subscription — Mini App UI (Zentra-inspired, accent #E8380D) */
import { useEffect, useMemo, useState } from "react";
import {
  Star, Shield, CheckCircle2, Lock, Loader2, ArrowRight, ChevronLeft,
  Sparkles, User, Clock, Zap, Bell, BarChart3, Users, Rocket, Globe, Award, Crown,
  Copy, Check, Receipt, LogOut, Settings,
} from "lucide-react";
import { api, initSession, type Plan, type PlanId, type Channel, type Payment, type Subscription, type UserOut } from "./api";

type Page = "welcome" | "plans" | "profile" | "success" | "error";
type Status = "idle" | "loading" | "success" | "error";

const ACCENT_ICON: Record<string, React.ElementType> = {
  zap: Zap, bell: Bell, chart: BarChart3, users: Users, shield: Shield,
  star: Star, rocket: Rocket, globe: Globe, award: Award, crown: Crown,
  sparkles: Sparkles, clock: Clock, check: CheckCircle2, lock: Lock,
};
const iconFor = (s: string) => ACCENT_ICON[s.toLowerCase()] ?? CheckCircle2;

// Telegram WebApp helpers
type TGWebApp = {
  ready?: () => void; expand?: () => void;
  openInvoice?: (url: string, cb: (s: string) => void) => void;
  close?: () => void;
};
const tg = (): TGWebApp | undefined =>
  (window as unknown as { Telegram?: { WebApp?: TGWebApp } }).Telegram?.WebApp;

/* ────────────────────────────────────────────────────────────────────────── */

export default function App() {
  const [page, setPage] = useState<Page>("welcome");
  const [slide, setSlide] = useState(0); // welcome slides
  const [user, setUser] = useState<UserOut | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selected, setSelected] = useState<PlanId>("pro");
  const [status, setStatus] = useState<Status>("idle");
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    tg()?.ready?.(); tg()?.expand?.();
    (async () => {
      const me = await initSession();
      if (me) setUser(me);
      try {
        const [p, s, c, pay] = await Promise.all([
          api.getPlans(),
          api.getMySubscription().catch(() => null),
          api.getMyChannels().catch(() => [] as Channel[]),
          api.getMyPayments().catch(() => [] as Payment[]),
        ]);
        setPlans(p); setSub(s); setChannels(c); setPayments(pay);
      } catch (e) {
        setErr(String(e));
      }
    })();
  }, []);

  const selectedPlan = plans.find(p => p.id === selected) ?? plans[0];

  const handlePay = async () => {
    if (!selectedPlan) return;
    setStatus("loading"); setErr("");
    try {
      const { invoice_link } = await api.createInvoice(selectedPlan.id);
      const w = tg();
      if (w?.openInvoice) {
        w.openInvoice(invoice_link, async (s) => {
          if (s === "paid") {
            setStatus("success"); setPage("success");
            setSub(await api.getMySubscription().catch(() => sub));
            setPayments(await api.getMyPayments().catch(() => payments));
          } else if (s === "failed" || s === "cancelled") {
            setStatus("error"); setPage("error");
          } else {
            setStatus("idle");
          }
        });
      } else {
        // fallback: just open the link
        window.open(invoice_link, "_blank");
        setStatus("idle");
      }
    } catch (e) {
      setErr(String(e)); setStatus("error"); setPage("error");
    }
  };

  return (
    <div className="glow-bg min-h-screen w-full flex flex-col items-center">
      <div className="w-full max-w-[440px] min-h-screen flex flex-col px-5 pt-12 pb-8 relative">
        {page === "welcome" && (
          <WelcomePage
            slide={slide} setSlide={setSlide}
            onStart={() => setPage("plans")}
            onProfile={() => setPage("profile")}
            user={user}
          />
        )}
        {page === "plans" && (
          <PlansPage
            plans={plans} selected={selected} setSelected={setSelected}
            onContinue={handlePay} onBack={() => setPage("welcome")}
            status={status}
          />
        )}
        {page === "profile" && (
          <ProfilePage
            user={user} sub={sub} channels={channels} payments={payments}
            onBack={() => setPage("welcome")} onUpgrade={() => setPage("plans")}
          />
        )}
        {page === "success" && (
          <ResultPage kind="success" plan={selectedPlan}
            onHome={() => setPage("welcome")} onProfile={() => setPage("profile")} />
        )}
        {page === "error" && (
          <ResultPage kind="error" plan={selectedPlan} message={err}
            onHome={() => setPage("welcome")} onRetry={() => setPage("plans")} />
        )}
      </div>
    </div>
  );
}

/* ── Welcome ────────────────────────────────────────────────────────────── */

const SLIDES = [
  {
    kicker: "TG STARS",
    title1: "Own Your Access,",
    title2: "Shape Your Future.",
    body: "From casual reader to VIP insider — unlock premium channels with Telegram Stars in a single tap.",
  },
  {
    kicker: "INSTANT",
    title1: "Pay with Stars,",
    title2: "skip the cards.",
    body: "Telegram Stars (XTR) is the native in-app currency. Top-up once, subscribe anywhere — no cards, no forms.",
  },
  {
    kicker: "SECURE",
    title1: "Every payment,",
    title2: "verified on-chain.",
    body: "All transactions are signed by Telegram and stored in your payment history. Refunds handled via support.",
  },
];

function WelcomePage({
  slide, setSlide, onStart, onProfile, user,
}: {
  slide: number; setSlide: (n: number) => void;
  onStart: () => void; onProfile: () => void; user: UserOut | null;
}) {
  const s = SLIDES[slide];
  const isLast = slide === SLIDES.length - 1;
  return (
    <>
      <TopBar
        right={user ? (
          <button onClick={onProfile}
            className="glass px-3 py-2 flex items-center gap-2 text-xs uppercase tracking-widest text-white/70 hover:text-white transition">
            <User size={14} />
            {user.username ?? user.first_name ?? `ID ${user.tg_id}`}
          </button>
        ) : null}
      />

      <div className="flex-1 flex flex-col justify-end pb-6">
        <div className="text-[11px] tracking-[0.35em] text-brand-400 uppercase mb-4 flex items-center gap-2">
          <Sparkles size={12} /> {s.kicker}
        </div>
        <h1 className="text-white text-[40px] leading-[1.05] font-semibold tracking-tight">
          {s.title1}<br />
          <span className="bg-clip-text text-transparent bg-[linear-gradient(90deg,#ff9c6b_0%,#e8380d_55%,#ff6628_100%)]">
            {s.title2}
          </span>
        </h1>
        <p className="text-white/55 text-[15px] leading-relaxed mt-4 max-w-[95%]">
          {s.body}
        </p>

        <div className="flex items-center gap-2 mt-6">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={
                "h-1.5 rounded-full transition-all " +
                (i === slide ? "w-8 bg-white" : "w-2 bg-white/25")
              } aria-label={`slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto">
        <button
          onClick={() => isLast ? onStart() : setSlide(slide + 1)}
          className="cta-gradient w-full h-14 rounded-2xl text-white font-semibold text-[16px] tracking-wide
                     flex items-center justify-center gap-2 active:scale-[0.99] transition"
        >
          {isLast ? "GET STARTED" : "NEXT"}
          <ArrowRight size={18} />
        </button>
        <button
          onClick={onStart}
          className="w-full h-12 text-white/60 text-sm tracking-wider mt-2 hover:text-white transition"
        >
          SKIP
        </button>
      </div>
    </>
  );
}

/* ── Plans paywall ──────────────────────────────────────────────────────── */

function PlansPage({
  plans, selected, setSelected, onContinue, onBack, status,
}: {
  plans: Plan[]; selected: PlanId; setSelected: (id: PlanId) => void;
  onContinue: () => void; onBack: () => void; status: Status;
}) {
  const current = plans.find(p => p.id === selected) ?? plans[0];
  const loading = status === "loading";

  return (
    <>
      <TopBar left={
        <button onClick={onBack} className="p-2 -ml-2 text-white/70 hover:text-white">
          <ChevronLeft size={22} />
        </button>
      } center={<Logo small />} />

      <div className="glass mt-4 p-6 flex-1 flex flex-col">
        <div className="text-center mb-5">
          <h2 className="text-[34px] font-semibold leading-tight text-white">More Control</h2>
          <p className="text-white/55 text-[15px] mt-1">to grow your access faster.</p>
        </div>

        {/* Plan tabs */}
        <div className="relative flex rounded-2xl bg-white/5 p-1 border border-white/10 mb-5">
          {plans.map((p) => {
            const active = p.id === selected;
            return (
              <button key={p.id} onClick={() => setSelected(p.id)}
                className={
                  "flex-1 h-10 rounded-xl text-[13px] font-semibold tracking-wider uppercase transition-all " +
                  (active
                    ? "cta-gradient text-white shadow-lg"
                    : "text-white/60 hover:text-white")
                }
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Feature list */}
        <div className="flex flex-col gap-2.5 flex-1">
          {current?.features?.map((f, i) => {
            const unlocked = i < 2 || selected !== "basic";
            const Icon = iconFor(f.icon);
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/5">
                <div className={
                  "mt-0.5 h-8 w-8 shrink-0 rounded-full flex items-center justify-center " +
                  (unlocked ? "bg-brand-500/15 text-brand-400" : "bg-white/5 text-white/30")
                }>
                  <Icon size={16} />
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-medium text-white leading-snug">{f.text}</div>
                  <div className="text-[12px] text-white/45 leading-snug mt-0.5">
                    {unlocked ? "Included in your plan." : "Upgrade to unlock."}
                  </div>
                </div>
                <div className="mt-1 text-white/40">
                  {unlocked ? <CheckCircle2 size={18} className="text-brand-400" /> : <Lock size={16} />}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-white/40 text-center text-[12px] mt-4 max-w-[90%] mx-auto leading-relaxed">
          and more features unlocked with each plan.
        </p>

        <button
          disabled={!current || loading}
          onClick={onContinue}
          className="cta-gradient mt-4 w-full h-14 rounded-2xl text-white font-semibold text-[15px]
                     flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : (
            <>
              Continue — 1 month for&nbsp;
              <span className="inline-flex items-center gap-1">
                {current?.stars ?? "—"} <Star size={14} className="fill-white" />
              </span>
            </>
          )}
        </button>
        <p className="text-white/35 text-center text-[11px] mt-3 leading-relaxed">
          Recurring billing. Cancel anytime. By tapping Continue you agree to our&nbsp;
          <a className="text-brand-400 underline">Terms of Service</a>.
        </p>
      </div>
    </>
  );
}

/* ── Profile ────────────────────────────────────────────────────────────── */

function ProfilePage({
  user, sub, channels, payments, onBack, onUpgrade,
}: {
  user: UserOut | null; sub: Subscription | null;
  channels: Channel[]; payments: Payment[];
  onBack: () => void; onUpgrade: () => void;
}) {
  const plan = sub?.plan;
  const daysLeft = sub?.days_left ?? 0;
  const [copied, setCopied] = useState<string | null>(null);

  return (
    <>
      <TopBar
        left={<button onClick={onBack} className="p-2 -ml-2 text-white/70 hover:text-white"><ChevronLeft size={22} /></button>}
        center={<span className="uppercase tracking-[0.3em] text-[11px] text-white/50">Profile</span>}
        right={<button className="p-2 text-white/50 hover:text-white"><Settings size={18} /></button>}
      />

      {/* User card */}
      <div className="glass mt-4 p-5 flex items-center gap-4">
        <div className="h-14 w-14 rounded-full cta-gradient flex items-center justify-center text-white text-lg font-semibold">
          {(user?.first_name ?? user?.username ?? "U").slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="text-white text-[16px] font-semibold">
            {user?.first_name ?? user?.username ?? "Telegram User"}
          </div>
          <div className="text-white/45 text-[12px] tracking-wider uppercase">
            @{user?.username ?? `id${user?.tg_id ?? ""}`} {user?.is_admin && "· ADMIN"}
          </div>
        </div>
      </div>

      {/* Subscription card */}
      <div className="glass mt-3 p-5">
        <div className="flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-[0.3em] text-white/50">Active Plan</div>
          {plan?.badge && <Badge>{plan.badge}</Badge>}
        </div>
        {plan ? (
          <>
            <div className="flex items-baseline gap-2 mt-1">
              <div className="text-[26px] font-semibold text-white">{plan.label}</div>
              <div className="text-brand-400 text-[15px] flex items-center gap-1">
                {plan.stars} <Star size={12} className="fill-brand-400" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric label="Days left" value={`${daysLeft}`} />
              <Metric label="Expires" value={sub?.expires_at ? new Date(sub.expires_at).toLocaleDateString() : "—"} />
            </div>
          </>
        ) : (
          <>
            <div className="text-white/60 mt-1 text-sm">No active subscription.</div>
            <button onClick={onUpgrade}
              className="cta-gradient mt-4 w-full h-12 rounded-xl text-white font-semibold flex items-center justify-center gap-2">
              Subscribe now <ArrowRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Channels */}
      <SectionHeader title="Your Channels" icon={Globe} />
      <div className="glass p-2 flex flex-col gap-1">
        {channels.length === 0 && <Empty text="No channels yet. Subscribe to unlock." />}
        {channels.map((c) => (
          <div key={c.id} className="p-3 rounded-xl hover:bg-white/[0.04] flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand-500/15 text-brand-400 flex items-center justify-center">
              <Globe size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-[14px] font-medium truncate">{c.name}</div>
              <div className="text-white/40 text-[12px] truncate">{c.handle} · {c.members.toLocaleString()} members</div>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(c.invite_link); setCopied(c.id); setTimeout(() => setCopied(null), 1200); }}
              className="text-white/60 hover:text-white p-2"
              title="Copy invite link"
            >
              {copied === c.id ? <Check size={16} className="text-brand-400" /> : <Copy size={16} />}
            </button>
          </div>
        ))}
      </div>

      {/* Payments */}
      <SectionHeader title="Payment History" icon={Receipt} />
      <div className="glass p-2 flex flex-col gap-1 mb-6">
        {payments.length === 0 && <Empty text="No payments yet." />}
        {payments.map((p) => (
          <div key={p.id} className="p-3 rounded-xl hover:bg-white/[0.04] flex items-center gap-3">
            <div className={
              "h-9 w-9 rounded-lg flex items-center justify-center " +
              (p.status === "success" ? "bg-emerald-500/10 text-emerald-400"
                : p.status === "failed" ? "bg-rose-500/10 text-rose-400"
                : "bg-white/5 text-white/40")
            }>
              <Star size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-[14px] truncate">{p.plan_label} · {p.stars}★</div>
              <div className="text-white/40 text-[11px] uppercase tracking-wider">{p.status} · {new Date(p.created_at).toLocaleDateString()}</div>
            </div>
            <div className="text-white/40 text-[11px] font-mono">{p.id.slice(0, 8)}</div>
          </div>
        ))}
      </div>

      <button
        onClick={() => tg()?.close?.()}
        className="text-white/40 text-xs uppercase tracking-widest mx-auto flex items-center gap-2 mt-auto hover:text-white/80">
        <LogOut size={14} /> Close app
      </button>
    </>
  );
}

/* ── Result pages ───────────────────────────────────────────────────────── */

function ResultPage({
  kind, plan, onHome, onProfile, onRetry, message,
}: {
  kind: "success" | "error";
  plan?: Plan;
  onHome: () => void; onProfile?: () => void; onRetry?: () => void;
  message?: string;
}) {
  const ok = kind === "success";
  return (
    <>
      <TopBar center={<Logo small />} />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
        <div className={
          "h-20 w-20 rounded-full flex items-center justify-center mb-6 " +
          (ok ? "cta-gradient" : "bg-rose-500/20 border border-rose-500/30")
        }>
          {ok ? <CheckCircle2 size={38} className="text-white" /> : <Lock size={32} className="text-rose-400" />}
        </div>
        <h2 className="text-white text-[30px] font-semibold leading-tight">
          {ok ? "Payment Success" : "Payment Failed"}
        </h2>
        <p className="text-white/55 text-[15px] mt-2 max-w-[85%]">
          {ok
            ? `You're now on ${plan?.label ?? ""}. Access unlocked.`
            : (message ? message : "Transaction was not completed. Please try again.")}
        </p>
        {ok && plan && (
          <div className="glass mt-6 p-5 w-full">
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Plan" value={plan.label} />
              <Metric label="Amount" value={`${plan.stars} ★`} />
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 space-y-2">
        {ok ? (
          <>
            <button onClick={onProfile} className="cta-gradient w-full h-14 rounded-2xl text-white font-semibold flex items-center justify-center gap-2">
              View Profile <ArrowRight size={16} />
            </button>
            <button onClick={onHome} className="w-full h-12 text-white/60 text-sm tracking-wider hover:text-white">BACK TO HOME</button>
          </>
        ) : (
          <>
            <button onClick={onRetry} className="cta-gradient w-full h-14 rounded-2xl text-white font-semibold">Try again</button>
            <button onClick={onHome} className="w-full h-12 text-white/60 text-sm tracking-wider hover:text-white">BACK TO HOME</button>
          </>
        )}
      </div>
    </>
  );
}

/* ── Small bits ─────────────────────────────────────────────────────────── */

function TopBar({ left, center, right }: { left?: React.ReactNode; center?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between h-10">
      <div className="min-w-[40px] flex items-center">{left ?? <Logo />}</div>
      <div className="flex-1 flex items-center justify-center">{center}</div>
      <div className="min-w-[40px] flex items-center justify-end">{right}</div>
    </div>
  );
}

function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-6 w-6 rounded-full cta-gradient flex items-center justify-center">
        <Star size={12} className="fill-white text-white" />
      </div>
      {!small && (
        <div className="text-white font-semibold tracking-wider text-[14px]">TG STARS</div>
      )}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] tracking-widest uppercase px-2 py-1 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/25">
      {children}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.04] border border-white/5 p-3">
      <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">{label}</div>
      <div className="text-white text-[15px] font-semibold mt-1">{value}</div>
    </div>
  );
}

function SectionHeader({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 mt-6 mb-2 text-white/55 text-[11px] uppercase tracking-[0.3em]">
      <Icon size={12} /> {title}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="p-6 text-center text-white/40 text-sm">{text}</div>;
}

/* helper reference to satisfy unused-var rule for lucide imports we re-expose */
void useMemo;
