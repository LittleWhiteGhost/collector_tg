/* TG Stars Subscription — Mini App (responsive, Zentra-inspired, accent #E8380D) */
import { useEffect, useState } from "react";
import Shell, { type Page } from "./components/Shell";
import Welcome from "./pages/Welcome";
import Plans from "./pages/Plans";
import Profile from "./pages/Profile";
import Result from "./pages/Result";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminChannels from "./pages/admin/Channels";
import AdminPlans from "./pages/admin/Plans";
import AdminUsers from "./pages/admin/Users";
import AdminPayments from "./pages/admin/Payments";
import { api, initSession, type Channel, type Payment, type Plan, type PlanId, type Subscription, type UserOut } from "./api";
import { tg } from "./lib/tg";

type Status = "idle" | "loading" | "success" | "error";

export default function App() {
  const [page, setPage] = useState<Page>("welcome");
  const [slide, setSlide] = useState(0);
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
      await refresh();
    })();
  }, []);

  const refresh = async () => {
    try {
      const [p, s, c, pay] = await Promise.all([
        api.getPlans(),
        api.getMySubscription().catch(() => null),
        api.getMyChannels().catch(() => [] as Channel[]),
        api.getMyPayments().catch(() => [] as Payment[]),
      ]);
      setPlans(p);
      setSub(s);
      setChannels(c);
      setPayments(pay);
      if (p.length > 0 && !p.find(x => x.id === selected)) setSelected(p[0].id);
    } catch (e) {
      setErr(String(e));
    }
  };

  const currentPlan = plans.find(pp => pp.id === selected) ?? plans[0];

  const handlePay = async () => {
    if (!currentPlan) return;
    setStatus("loading"); setErr("");
    try {
      const { invoice_link } = await api.createInvoice(currentPlan.id);
      const w = tg();
      if (w?.openInvoice) {
        w.openInvoice(invoice_link, async (s) => {
          if (s === "paid") {
            setStatus("success"); setPage("success"); await refresh();
          } else if (s === "failed" || s === "cancelled") {
            setStatus("error"); setPage("error");
          } else {
            setStatus("idle");
          }
        });
      } else {
        window.open(invoice_link, "_blank");
        setStatus("idle");
      }
    } catch (e) {
      setErr(String(e)); setStatus("error"); setPage("error");
    }
  };

  // Welcome + Result pages bypass the Shell for full-takeover impact
  if (page === "welcome") {
    return <Welcome slide={slide} setSlide={setSlide} onStart={() => setPage("plans")} />;
  }
  if (page === "success" || page === "error") {
    return (
      <div className="glow-bg min-h-screen w-full grid place-items-center px-5">
        <Result
          kind={page}
          message={err || undefined}
          onHome={() => { setPage(page === "success" ? "profile" : "plans"); setStatus("idle"); setErr(""); }}
          onRetry={page === "error" ? handlePay : undefined}
        />
      </div>
    );
  }

  return (
    <Shell user={user} page={page} onNavigate={setPage}>
      {page === "plans" && (
        <Plans plans={plans} subscription={sub} selected={selected} onSelect={setSelected} onPay={handlePay} status={status} />
      )}
      {page === "profile" && (
        <Profile user={user} subscription={sub} channels={channels} payments={payments} onUpgrade={() => setPage("plans")} />
      )}
      {page === "admin:dashboard" && <AdminDashboard />}
      {page === "admin:channels"  && <AdminChannels  />}
      {page === "admin:plans"     && <AdminPlans     />}
      {page === "admin:users"     && <AdminUsers     />}
      {page === "admin:payments"  && <AdminPayments  />}
    </Shell>
  );
}
