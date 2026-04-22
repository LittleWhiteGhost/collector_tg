import { useEffect, useState } from "react";
import { Activity, TrendingUp, Users, Radio, Star, BarChart3, DollarSign } from "lucide-react";
import { api, type StatsAnalytics, type StatsOverview } from "../../api";
import { Card, ErrorBlock, LoadingBlock, Section, Stat } from "../../components/ui";

export default function AdminDashboard() {
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [analytics, setAnalytics] = useState<StatsAnalytics | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [o, a] = await Promise.all([api.adminOverview(), api.adminAnalytics()]);
        setOverview(o); setAnalytics(a);
      } catch (e) { setErr(String(e)); }
    })();
  }, []);

  if (err) return <ErrorBlock>{err}</ErrorBlock>;
  if (!overview || !analytics) return <LoadingBlock />;

  const peak = Math.max(1, ...analytics.weekly_trend.map(p => p.stars));

  return (
    <Section kicker="Admin · Dashboard" title="Overview">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Stat label="Channels" value={overview.total_channels} hint={`${overview.active_channels} active`} />
        <Stat label="Members" value={overview.total_members.toLocaleString()} />
        <Stat label="Monthly ★" value={overview.est_monthly_stars.toLocaleString()} hint="estimated" />
        <Stat label="All-time ★" value={analytics.total_revenue_all_time.toLocaleString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] tracking-[0.3em] text-brand-400 uppercase font-semibold">Weekly revenue</p>
              <h3 className="text-xl font-bold">{analytics.total_weekly_stars.toLocaleString()} <Star className="inline h-4 w-4 fill-brand-400 text-brand-400 mb-1" /></h3>
            </div>
            <TrendingUp className="h-5 w-5 text-brand-400" />
          </div>
          <div className="flex items-end gap-2 h-40">
            {analytics.weekly_trend.map(p => (
              <div key={p.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t bg-gradient-to-t from-brand-700 to-brand-400" style={{ height: `${(p.stars / peak) * 100}%`, minHeight: 2 }} />
                <span className="text-[10px] text-ink-300 tracking-wider">{p.day}</span>
              </div>
            ))}
          </div>
          {analytics.best_day && (
            <p className="text-[11px] text-ink-300 mt-3 tracking-wider">Best day: <span className="text-white font-semibold">{analytics.best_day.day}</span> · {analytics.best_day.stars}★</p>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <p className="text-[10px] tracking-[0.3em] text-brand-400 uppercase font-semibold mb-3">Plan breakdown</p>
          <ul className="space-y-2">
            {Object.entries(overview.plan_breakdown).map(([plan, n]) => (
              <li key={plan} className="flex items-center justify-between text-sm">
                <span className="uppercase text-ink-300 tracking-wider text-[11px]">{plan}</span>
                <span className="font-bold">{n}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-3 text-center">
            <div><p className="text-[10px] text-ink-300 tracking-widest">CONV</p><p className="font-bold">{(analytics.conversion_rate * 100).toFixed(1)}%</p></div>
            <div><p className="text-[10px] text-ink-300 tracking-widest">CHURN</p><p className="font-bold">{(analytics.churn_rate * 100).toFixed(1)}%</p></div>
            <div><p className="text-[10px] text-ink-300 tracking-widest">ARPU</p><p className="font-bold">{Math.round(analytics.avg_rev_per_user)}★</p></div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] tracking-[0.3em] text-brand-400 uppercase font-semibold">Recent activity</p>
          <Activity className="h-4 w-4 text-brand-400" />
        </div>
        {analytics.recent_activity.length === 0 ? (
          <p className="text-sm text-ink-300">No recent events.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {analytics.recent_activity.slice(0, 12).map((r, i) => (
              <li key={i} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                <span className="text-ink-100">{r.text}</span>
                <span className="text-[11px] text-ink-300 tracking-wider shrink-0">{new Date(r.at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Section>
  );
}

export { Users, Radio, BarChart3, DollarSign };
