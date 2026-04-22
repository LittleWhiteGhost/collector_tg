import { useMemo } from "react";
import { Lock, CheckCircle2, Star, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import type { Plan, PlanId, Subscription } from "../api";
import { iconFor } from "../lib/icons";
import { Button, Badge } from "../components/ui";

interface Props {
  plans: Plan[];
  subscription: Subscription | null;
  selected: PlanId;
  onSelect: (id: PlanId) => void;
  onPay: () => void;
  status: "idle" | "loading" | "success" | "error";
}

export default function Plans({ plans, subscription, selected, onSelect, onPay, status }: Props) {
  const sorted = useMemo(
    () => [...plans].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0) || a.stars - b.stars),
    [plans]
  );
  const current = sorted.find(p => p.id === selected) ?? sorted[0];
  const isCurrent = subscription?.plan?.id === current?.id && subscription?.active;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* hero */}
      <div className="relative text-center space-y-3">
        <p className="text-[10px] tracking-[0.4em] text-brand-400 font-bold uppercase">Choose your plan</p>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.05]">
          More Control,<br/><span className="bg-gradient-to-r from-brand-300 via-brand-500 to-brand-700 bg-clip-text text-transparent">More Freedom.</span>
        </h1>
        <p className="text-sm text-ink-300 max-w-md mx-auto">Pay natively with Telegram Stars. Cancel anytime.</p>
      </div>

      {/* tabs */}
      <div className="flex justify-center overflow-x-auto no-scrollbar">
        <div className="inline-flex gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg">
          {sorted.map(p => {
            const active = p.id === current?.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className={`relative px-4 sm:px-5 py-2 rounded-xl text-[11px] sm:text-xs font-bold tracking-widest uppercase transition ${
                  active ? "bg-gradient-to-b from-brand-400 to-brand-700 text-white shadow-lg shadow-brand-500/40" : "text-ink-300 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* responsive grid: mobile = single card; lg+ = show all as comparison grid */}
      <div className="lg:hidden">
        {current && <PlanCard plan={current} highlight isCurrent={!!isCurrent} onSelect={() => onSelect(current.id)} />}
      </div>
      <div className="hidden lg:grid grid-cols-3 gap-5">
        {sorted.map(p => (
          <PlanCard
            key={p.id}
            plan={p}
            highlight={p.id === current?.id}
            isCurrent={subscription?.plan?.id === p.id && !!subscription?.active}
            onSelect={() => onSelect(p.id)}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="max-w-md mx-auto space-y-3">
        <Button
          onClick={onPay}
          disabled={status === "loading" || !current || isCurrent}
          className="w-full py-4 text-base"
        >
          {status === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : (
            isCurrent ? <>Active subscription</> : <>Continue — 1 month for <span className="inline-flex items-center gap-1 ml-1 font-bold">{current?.stars ?? 0} <Star className="h-4 w-4 fill-white" /></span></>
          )}
        </Button>
        <p className="text-center text-[11px] text-ink-300 tracking-wider flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-400" /> Secured by Telegram Stars · Instant activation
        </p>
      </div>
    </div>
  );
}

function PlanCard({ plan, highlight, isCurrent, onSelect }: {
  plan: Plan; highlight: boolean; isCurrent: boolean; onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`relative text-left w-full rounded-3xl p-5 sm:p-6 transition overflow-hidden border
        ${highlight
          ? "bg-gradient-to-b from-white/10 to-white/[0.02] border-brand-500/40 shadow-2xl shadow-brand-500/20"
          : "bg-white/[0.03] border-white/10 hover:border-white/20"}`}
    >
      {highlight && (
        <div className="absolute -top-16 -right-20 h-56 w-56 rounded-full bg-brand-500/30 blur-3xl pointer-events-none" />
      )}
      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">{plan.label}</h3>
            {plan.badge && <Badge tone="accent">{plan.badge}</Badge>}
          </div>
          <p className="text-[11px] text-ink-300 mt-1 tracking-wide">{plan.period_days} days access</p>
        </div>
        <div className="text-right">
          <p className="flex items-center justify-end gap-1 text-2xl sm:text-3xl font-bold">
            {plan.stars}<Star className="h-5 w-5 fill-brand-400 text-brand-400" />
          </p>
          <p className="text-[10px] text-ink-300 tracking-widest uppercase">per month</p>
        </div>
      </div>

      <ul className="relative mt-5 space-y-2.5">
        {plan.features.map((f, i) => {
          const Icon = iconFor(f.icon);
          return (
            <li key={i} className="flex items-center gap-3 text-[13px]">
              <span className={`h-7 w-7 rounded-lg grid place-items-center ${highlight ? "bg-brand-500/15 text-brand-300" : "bg-white/5 text-ink-300"}`}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className={highlight ? "text-white" : "text-ink-100/80"}>{f.text}</span>
              {highlight
                ? <CheckCircle2 className="ml-auto h-4 w-4 text-brand-400 shrink-0" />
                : <Lock className="ml-auto h-3.5 w-3.5 text-ink-300 shrink-0" />}
            </li>
          );
        })}
      </ul>

      {isCurrent && (
        <div className="relative mt-5 flex items-center gap-2 text-[11px] tracking-widest uppercase text-brand-300">
          <Sparkles className="h-3.5 w-3.5" /> Current plan
        </div>
      )}
    </button>
  );
}
