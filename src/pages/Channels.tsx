import { useMemo, useState } from "react";
import { Hash, Star, Users, Lock, CheckCircle2, Search } from "lucide-react";
import type { Plan, PlanId, PublicChannel, Subscription } from "../api";
import { Badge, Button, Empty, Input } from "./../components/ui";

interface Props {
  plans: Plan[];
  channels: PublicChannel[];
  subscription: Subscription | null;
  onChoosePlan: (id: PlanId) => void;
}

/** Minimum stars price across plans that unlock a given channel. */
function cheapestPlanFor(channelPlan: string, plans: Plan[]): Plan | undefined {
  const active = plans.filter(p => p.active !== false);
  if (channelPlan === "all") {
    return [...active].sort((a, b) => a.stars - b.stars)[0];
  }
  return active.find(p => p.id === channelPlan);
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

export default function Channels({ plans, channels, subscription, onChoosePlan }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const activePlanId = subscription?.active ? subscription.plan?.id : null;

  // Set of plan IDs that the user's current subscription covers (tiered: buying PRO
  // unlocks BASIC; buying ELITE unlocks PRO + BASIC — via order_index).
  const unlockedPlanIds = useMemo(() => {
    if (!activePlanId) return new Set<string>();
    const mine = plans.find(p => p.id === activePlanId);
    if (!mine) return new Set<string>([activePlanId]);
    const mineOrder = mine.order_index ?? mine.stars;
    return new Set(
      plans
        .filter(p => (p.order_index ?? p.stars) <= mineOrder)
        .map(p => p.id)
        .concat(["all"])
    );
  }, [plans, activePlanId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return channels.filter(c => {
      if (filter !== "all" && c.plan !== filter && c.plan !== "all") return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    });
  }, [channels, query, filter]);

  const planFilters = useMemo(() => {
    const ids = new Set(channels.map(c => c.plan));
    return plans.filter(p => ids.has(p.id) || ids.has("all"));
  }, [channels, plans]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* hero */}
      <div className="relative text-center space-y-3">
        <p className="text-[10px] tracking-[0.4em] text-brand-400 font-bold uppercase">Channels</p>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.05]">
          Unlock with <span className="bg-gradient-to-r from-brand-300 via-brand-500 to-brand-700 bg-clip-text text-transparent">Stars</span>.
        </h1>
        <p className="text-sm text-ink-300 max-w-md mx-auto">
          Browse every channel available. Tap any to see the plan that unlocks it.
        </p>
      </div>

      {/* search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300 pointer-events-none" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search channels…"
            className="pl-10"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 overflow-x-auto no-scrollbar">
          <FilterChip label="All" active={filter === "all"} onClick={() => setFilter("all")} />
          {planFilters.map(p => (
            <FilterChip key={p.id} label={p.label} active={filter === p.id} onClick={() => setFilter(p.id)} />
          ))}
        </div>
      </div>

      {/* grid */}
      {filtered.length === 0 ? (
        <Empty>No channels match your filter yet.</Empty>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => {
            const plan = cheapestPlanFor(c.plan, plans);
            const unlocked = unlockedPlanIds.has(c.plan);
            return (
              <div
                key={c.id}
                className="card-enter"
                style={{ animationDelay: `${Math.min(i * 40, 320)}ms` }}
              >
                <ChannelCard
                  channel={c}
                  plan={plan}
                  unlocked={unlocked}
                  onChoose={() => plan && onChoosePlan(plan.id as PlanId)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold tracking-widest uppercase transition whitespace-nowrap ${
        active
          ? "bg-gradient-to-b from-brand-400 to-brand-700 text-white shadow-lg shadow-brand-500/30"
          : "text-ink-300 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function ChannelCard({
  channel, plan, unlocked, onChoose,
}: {
  channel: PublicChannel;
  plan: Plan | undefined;
  unlocked: boolean;
  onChoose: () => void;
}) {
  return (
    <div
      className={`relative rounded-3xl p-5 border overflow-hidden transition h-full flex flex-col
        ${unlocked
          ? "bg-gradient-to-b from-emerald-500/10 to-white/[0.02] border-emerald-500/30"
          : "bg-white/[0.03] border-white/10 hover:border-brand-500/40"}`}
    >
      {!unlocked && (
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
      )}

      <div className="relative flex items-start gap-3">
        <div className={`h-11 w-11 rounded-xl grid place-items-center shrink-0 ${
          unlocked ? "bg-emerald-500/20 text-emerald-300" : "bg-brand-500/15 text-brand-300"
        }`}>
          <Hash className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-bold tracking-tight text-white truncate">{channel.name}</h3>
          <p className="text-[11px] text-ink-300 truncate">{channel.handle}</p>
        </div>
        {plan && <Badge tone={unlocked ? "success" : "accent"}>{plan.label}</Badge>}
      </div>

      {channel.description && (
        <p className="relative mt-3 text-[13px] text-ink-100/80 leading-snug line-clamp-3">
          {channel.description}
        </p>
      )}

      <div className="relative mt-4 flex items-center gap-3 text-[11px] text-ink-300">
        {channel.members > 0 && (
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-brand-400" />
            {formatCount(channel.members)} members
          </span>
        )}
      </div>

      <div className="relative mt-auto pt-4">
        {unlocked ? (
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[12px] text-emerald-300 font-semibold tracking-wide">
              <CheckCircle2 className="h-4 w-4" /> Unlocked
            </span>
            <span className="text-[11px] text-ink-300 tracking-widest uppercase">in Profile</span>
          </div>
        ) : plan ? (
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 text-xl font-bold text-white">
              {plan.stars}<Star className="h-4 w-4 fill-brand-400 text-brand-400" />
            </span>
            <Button onClick={onChoose} className="py-2 text-xs">
              <Lock className="h-3.5 w-3.5" /> Unlock
            </Button>
          </div>
        ) : (
          <p className="text-[11px] text-ink-300">Plan unavailable</p>
        )}
      </div>
    </div>
  );
}
