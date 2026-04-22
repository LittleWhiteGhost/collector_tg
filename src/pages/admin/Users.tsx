import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { api, type AdminUser } from "../../api";
import { Badge, Card, Empty, ErrorBlock, LoadingBlock, Section } from "../../components/ui";

const FILTERS = ["all", "basic", "pro", "elite"] as const;

export default function AdminUsers() {
  const [rows, setRows] = useState<AdminUser[] | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try { setRows(await api.adminListUsers(filter)); setErr(null); }
      catch (e) { setErr(String(e)); }
    })();
  }, [filter]);

  return (
    <Section
      kicker="Admin · Users"
      title="Users"
      actions={
        <div className="inline-flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
          {FILTERS.map(f => (
            <button key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-widest uppercase transition ${filter === f ? "bg-brand-500 text-white" : "text-ink-300 hover:text-white"}`}>
              {f}
            </button>
          ))}
        </div>
      }
    >
      {err && <ErrorBlock>{err}</ErrorBlock>}
      {!rows ? <LoadingBlock /> : rows.length === 0 ? <Empty>No users match this filter.</Empty> : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] tracking-widest text-ink-300 uppercase">
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Plan</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Since</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Expires</th>
                  <th className="text-left px-4 py-3">Spent</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{u.username ? `@${u.username}` : `tg_${u.tg_id}`}</p>
                      <p className="text-[10px] text-ink-300 sm:hidden">{u.plan?.toUpperCase() ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">{u.plan ? <Badge>{u.plan.toUpperCase()}</Badge> : <span className="text-ink-300">—</span>}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-ink-300 text-[12px]">{u.since ? new Date(u.since).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-ink-300 text-[12px]">{u.expires_at ? new Date(u.expires_at).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3 font-semibold inline-flex items-center gap-1">{u.stars_spent}<Star className="h-3.5 w-3.5 fill-brand-400 text-brand-400" /></td>
                    <td className="px-4 py-3">
                      {u.active ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </Section>
  );
}
