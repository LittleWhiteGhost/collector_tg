import { useState } from "react";
import { User as UserIcon, Copy, Check, Calendar, Clock, Receipt, Radio, Sparkles, Star } from "lucide-react";
import type { Channel, Payment, Subscription, UserOut } from "../api";
import { Badge, Button, Card, Empty, Stat } from "../components/ui";

function fmt(d: string | null): string {
  if (!d) return "—";
  const t = new Date(d);
  return t.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function Profile({ user, subscription, channels, payments, onUpgrade }: {
  user: UserOut | null;
  subscription: Subscription | null;
  channels: Channel[];
  payments: Payment[];
  onUpgrade: () => void;
}) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="flex items-center gap-4">
        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-brand-400 to-brand-800 grid place-items-center text-2xl sm:text-3xl font-bold shadow-lg shadow-brand-500/30">
          {user?.first_name?.[0]?.toUpperCase() ?? user?.username?.[0]?.toUpperCase() ?? <UserIcon className="h-8 w-8" />}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.3em] text-brand-400 uppercase font-semibold">Profile</p>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
            {user?.first_name || user?.username || "Anonymous"}
          </h1>
          <p className="text-[12px] text-ink-300 truncate">{user?.username ? `@${user.username}` : `tg_id: ${user?.tg_id ?? "—"}`}</p>
        </div>
        {user?.is_admin && <Badge tone="accent">Admin</Badge>}
      </header>

      {/* subscription */}
      {subscription?.active && subscription.plan ? (
        <Card className="relative overflow-hidden">
          <div className="absolute -top-24 -right-10 h-64 w-64 rounded-full bg-brand-500/25 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-[0.3em] text-brand-400 uppercase font-semibold">Current plan</p>
              <h2 className="text-3xl font-bold tracking-tight">{subscription.plan.label}</h2>
              <p className="text-[12px] text-ink-300 mt-1">Active · renews on Stars checkout</p>
            </div>
            <Button variant="outline" onClick={onUpgrade}><Sparkles className="h-4 w-4" />Change plan</Button>
          </div>
          <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <Stat label="Days left" value={subscription.days_left} />
            <Stat label="Expires" value={fmt(subscription.expires_at)} />
            <Stat label="Since" value={fmt(subscription.started_at)} />
            <Stat label="Price" value={<span className="inline-flex items-center gap-1">{subscription.plan.stars}<Star className="h-5 w-5 fill-brand-400 text-brand-400"/></span>} />
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-col items-center text-center gap-3 py-2">
            <div className="h-14 w-14 rounded-2xl bg-white/5 grid place-items-center">
              <Star className="h-6 w-6 text-brand-400" />
            </div>
            <h2 className="text-xl font-bold">No active subscription</h2>
            <p className="text-[13px] text-ink-300 max-w-xs">Pick a plan to unlock premium channels, analytics and instant access.</p>
            <Button onClick={onUpgrade}>Choose a plan</Button>
          </div>
        </Card>
      )}

      {/* channels */}
      <section className="space-y-3">
        <h3 className="text-[11px] tracking-[0.3em] text-ink-300 uppercase font-semibold flex items-center gap-2">
          <Radio className="h-3.5 w-3.5" /> My channels
        </h3>
        {channels.length === 0 ? (
          <Empty>You don't have access to any channels yet.</Empty>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {channels.map(c => <ChannelRow key={c.id} channel={c} />)}
          </div>
        )}
      </section>

      {/* payments */}
      <section className="space-y-3">
        <h3 className="text-[11px] tracking-[0.3em] text-ink-300 uppercase font-semibold flex items-center gap-2">
          <Receipt className="h-3.5 w-3.5" /> Payment history
        </h3>
        {payments.length === 0 ? (
          <Empty>No payments yet.</Empty>
        ) : (
          <Card padded={false}>
            <ul className="divide-y divide-white/5">
              {payments.map(p => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{p.plan_label}</p>
                    <p className="text-[11px] text-ink-300 flex items-center gap-1.5"><Calendar className="h-3 w-3" />{fmt(p.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold inline-flex items-center gap-1">{p.stars}<Star className="h-4 w-4 fill-brand-400 text-brand-400" /></span>
                    <Badge tone={p.status === "success" ? "success" : p.status === "failed" ? "danger" : "default"}>{p.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}

function ChannelRow({ channel }: { channel: Channel }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!channel.invite_link) return;
    try { await navigator.clipboard.writeText(channel.invite_link); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold tracking-tight truncate">{channel.name}</p>
            <Badge>{channel.plan.toUpperCase()}</Badge>
          </div>
          <p className="text-[11px] text-ink-300 truncate mt-0.5">{channel.handle} · {channel.members} members</p>
          {channel.description && <p className="text-[12px] text-ink-100/80 mt-2 line-clamp-2">{channel.description}</p>}
        </div>
        {channel.invite_link && (
          <button
            onClick={copy}
            className="shrink-0 inline-flex items-center gap-1.5 text-[11px] tracking-widest uppercase text-brand-300 hover:text-brand-400 transition px-2.5 py-1.5 rounded-lg bg-white/5"
            title="Copy invite link"
          >
            {copied ? <><Check className="h-3.5 w-3.5" />Copied</> : <><Copy className="h-3.5 w-3.5" />Copy</>}
          </button>
        )}
      </div>
    </Card>
  );
}

export { Clock };
