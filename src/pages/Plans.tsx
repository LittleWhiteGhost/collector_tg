import { useEffect, useMemo, useState } from "react";
import { Lock, CheckCircle2, Star, Loader2, ShieldCheck, Sparkles, Hash, Users, Tv2, Tag, X } from "lucide-react";
import { api, type Plan, type PlanId, type PublicChannel, type Subscription } from "../api";
import { iconFor } from "../lib/icons";
import { Button, Badge } from "../components/ui";

interface Props {
  plans: Plan[];
  channels: PublicChannel[];
  subscription: Subscription | null;
  selected: PlanId;
  onSelect: (id: PlanId) => void;
  onPay: (promoCode?: string) => void;
  status: "idle" | "loading" | "success" | "error";
}

function channelsForPlan(planId: string, all: PublicChannel[]): PublicChannel[] {
  return all.filter(c => c.plan === planId || c.plan === "all");
}

function formatPeriod(days: number): string {
  if (!days || days <= 0) return "access";
  if (days === 1) return "1 day";
  if (days % 365 === 0) {
    const y = days / 365;
    return y === 1 ? "1 year" : `${y} years`;
  }
  if (days === 7) return "1 week";
  if (days % 30 === 0 && days <= 360) {
    const m = days / 30;
    return m === 1 ? "1 month" : `${m} months`;
  }
  return `${days} days`;
}

export default function Plans({ plans, channels, subscription, selected, onSelect, onPay, status }: Props) {
  const sorted = useMemo(
    () => [...plans].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0) || a.stars - b.stars),
    [plans]
  );
  const current = sorted.find(p => p.id === selected) ?? sorted[0];
  const isCurrent = subscription?.plan?.id === current?.id && subscription?.active;

  const totalMembers = channels.reduce((acc, c) => acc + (c.members || 0), 0);

  // Promo code state — validated against backend on Apply, cleared on plan switch.
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ code: string; percent: number; finalStars: number } | null>(null);
  const [promoStatus, setPromoStatus] = useState<"idle" | "validating" | "error">("idle");
  const [promoErr, setPromoErr] = useState<string>("");

  useEffect(() => {
    // Clear on plan switch — different plan may require different code.
    setPromoApplied(null);
    setPromoStatus("idle");
    setPromoErr("");
  }, [current?.id]);

  const applyPromo = async () => {
    if (!current || !promoInput.trim()) return;
    setPromoStatus("validating");
    setPromoErr("");
    try {
      const res = await api.validatePromo(promoInput.trim().toUpperCase(), current.id);
      if (res.ok) {
        setPromoApplied({ code: promoInput.trim().toUpperCase(), percent: res.discount_percent, finalStars: res.final_stars });
        setPromoStatus("idle");
      } else {
        setPromoErr(friendlyPromoError(res.error));
        setPromoStatus("error");
      }
    } catch {
      setPromoErr("Failed to check code. Try again.");
      setPromoStatus("error");
    }
  };

  const clearPromo = () => {
    setPromoApplied(null);
    setPromoInput("");
    setPromoStatus("idle");
    setPromoErr("");
  };

  const finalPrice = promoApplied?.finalStars ?? current?.stars ?? 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* hero */}
      <div className="relative text-center space-y-3">
        <p className="text-[10px] tracking-[0.4em] text-brand-400 font-bold uppercase">Choose your plan</p>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.05]">
          More Control,<br/><span className="bg-gradient-to-r from-brand-300 via-brand-500 to-brand-700 bg-clip-text text-transparent">More Freedom.</span>
        </h1>
        <p className="text-sm text-ink-300 max-w-md mx-auto">Pay natively with Telegram Stars. Cancel anytime.</p>

        {channels.length > 0 && (
          <div className="mt-4 inline-flex items-center gap-4 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] tracking-widest uppercase text-ink-300">
            <span className="flex items-center gap-1.5"><Tv2 className="h-3.5 w-3.5 text-brand-400"/> {channels.length} channels</span>
            {totalMembers > 0 && (
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-brand-400"/> {formatCount(totalMembers)} members</span>
            )}
          </div>
        )}
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
        {current && (
          <div key={current.id} className="card-enter">
            <PlanCard
              plan={current}
              channels={channelsForPlan(current.id, channels)}
              highlight
              isCurrent={!!isCurrent}
              onSelect={() => onSelect(current.id)}
            />
          </div>
        )}
      </div>
      <div className="hidden lg:grid grid-cols-3 gap-5">
        {sorted.map(p => (
          <PlanCard
            key={p.id}
            plan={p}
            channels={channelsForPlan(p.id, channels)}
            highlight={p.id === current?.id}
            isCurrent={subscription?.plan?.id === p.id && !!subscription?.active}
            onSelect={() => onSelect(p.id)}
          />
        ))}
      </div>

      {/* Promo code */}
      {current && !isCurrent && (
        <div className="max-w-md mx-auto">
          {promoApplied ? (
            <div className="flex items-center justify-between rounded-2xl border border-brand-500/40 bg-brand-500/10 px-4 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <Tag className="h-4 w-4 text-brand-400 shrink-0" />
                <span className="text-sm font-bold truncate">{promoApplied.code}</span>
                <span className="text-[11px] text-brand-300 tracking-widest uppercase">-{promoApplied.percent}%</span>
              </div>
              <button
                onClick={clearPromo}
                aria-label="Remove promo"
                className="p-1 rounded-md text-ink-300 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                  <Tag className="h-4 w-4 text-ink-300 shrink-0" />
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoErr(""); setPromoStatus("idle"); }}
                    onKeyDown={(e) => { if (e.key === "Enter") applyPromo(); }}
                    placeholder="Promo code (optional)"
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-ink-300/60 uppercase tracking-wider"
                  />
                </div>
                <button
                  onClick={applyPromo}
                  disabled={promoStatus === "validating" || !promoInput.trim()}
                  className="px-4 rounded-2xl text-xs font-bold tracking-widest uppercase border border-white/10 bg-white/[0.04] hover:border-brand-500/40 hover:text-brand-300 disabled:opacity-40 transition"
                >
                  {promoStatus === "validating" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                </button>
              </div>
              {promoErr && <p className="text-[11px] text-red-400 mt-1.5 pl-1">{promoErr}</p>}
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="max-w-md mx-auto space-y-3">
        <Button
          onClick={() => onPay(promoApplied?.code)}
          disabled={status === "loading" || !current || isCurrent}
          className="w-full py-4 text-base"
        >
          {status === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : (
            isCurrent ? <>Active subscription</> : (
              <>Continue — {formatPeriod(current?.period_days ?? 0)} for
                <span className="inline-flex items-center gap-1 ml-1 font-bold">
                  {promoApplied && (
                    <span className="line-through opacity-60 text-sm mr-0.5 font-normal">{current?.stars ?? 0}</span>
                  )}
                  {finalPrice}
                  <Star className="h-4 w-4 fill-white" />
                </span>
              </>
            )
          )}
        </Button>
        <p className="text-center text-[11px] text-ink-300 tracking-wider flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-400" /> Secured by Telegram Stars · Instant activation
        </p>
      </div>
    </div>
  );
}

function friendlyPromoError(code: string | null): string {
  switch (code) {
    case "not_found":    return "Code not found or inactive.";
    case "expired":      return "This code has expired.";
    case "exhausted":    return "This code is fully used.";
    case "wrong_plan":   return "Code doesn't apply to this plan.";
    case "already_used": return "You already used this code.";
    case "empty_code":   return "Enter a code first.";
    default:             return "Invalid code.";
  }
}

function PlanCard({ plan, channels, highlight, isCurrent, onSelect }: {
  plan: Plan; channels: PublicChannel[]; highlight: boolean; isCurrent: boolean; onSelect: () => void;
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
          <p className="text-[11px] text-ink-300 mt-1 tracking-wide">{formatPeriod(plan.period_days)} access</p>
        </div>
        <div className="text-right">
          <p className="flex items-center justify-end gap-1 text-2xl sm:text-3xl font-bold">
            {plan.stars}<Star className="h-5 w-5 fill-brand-400 text-brand-400" />
          </p>
          <p className="text-[10px] text-ink-300 tracking-widest uppercase">for {formatPeriod(plan.period_days)}</p>
        </div>
      </div>

      {/* features */}
      {plan.features.length > 0 && (
        <ul className="relative mt-5 space-y-2.5">
          {plan.features.map((f, i) => {
            const Icon = iconFor(f.icon);
            return (
              <li
                key={i}
                className="flex items-center gap-3 text-[13px] fade-in"
                style={{ animationDelay: `${70 + i * 55}ms` }}
              >
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
      )}

      {/* included channels */}
      {channels.length > 0 && (
        <div className="relative mt-5 pt-4 border-t border-white/5">
          <p className="text-[10px] tracking-[0.25em] uppercase text-ink-300 mb-2.5 flex items-center gap-1.5">
            <Tv2 className="h-3 w-3 text-brand-400" /> Includes {channels.length} channel{channels.length === 1 ? "" : "s"}
          </p>
          <ul className="space-y-1.5">
            {channels.slice(0, 4).map((c, i) => (
              <li
                key={c.id}
                className="flex items-start gap-2 text-[12px] leading-tight fade-in"
                style={{ animationDelay: `${140 + i * 60}ms` }}
              >
                <Hash className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${highlight ? "text-brand-400" : "text-ink-300"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-white truncate">{c.name}</p>
                  {c.description && <p className="text-ink-300 text-[11px] truncate">{c.description}</p>}
                </div>
                {c.members > 0 && (
                  <span className="text-[10px] text-ink-300 tracking-wider shrink-0">
                    {formatCount(c.members)}
                  </span>
                )}
              </li>
            ))}
            {channels.length > 4 && (
              <li className="text-[11px] text-ink-300 pl-5">+ {channels.length - 4} more</li>
            )}
          </ul>
        </div>
      )}

      {isCurrent && (
        <div className="relative mt-5 flex items-center gap-2 text-[11px] tracking-widest uppercase text-brand-300">
          <Sparkles className="h-3.5 w-3.5" /> Current plan
        </div>
      )}
    </button>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}
