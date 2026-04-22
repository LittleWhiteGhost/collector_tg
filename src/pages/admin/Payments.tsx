import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { api, type Payment } from "../../api";
import { Badge, Card, Empty, ErrorBlock, LoadingBlock, Section, Stat } from "../../components/ui";

export default function AdminPayments() {
  const [rows, setRows] = useState<(Payment & { user_id: number })[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => { try { setRows(await api.adminPayments()); setErr(null); } catch (e) { setErr(String(e)); } })();
  }, []);

  const total = rows?.reduce((s, p) => s + (p.status === "success" ? p.stars : 0), 0) ?? 0;
  const count = rows?.length ?? 0;
  const success = rows?.filter(p => p.status === "success").length ?? 0;

  return (
    <Section kicker="Admin · Payments" title="Payments">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat label="Total payments" value={count} />
        <Stat label="Successful" value={success} />
        <Stat label="Revenue" value={<span className="inline-flex items-center gap-1">{total.toLocaleString()}<Star className="h-5 w-5 fill-brand-400 text-brand-400"/></span>} />
      </div>
      {err && <ErrorBlock>{err}</ErrorBlock>}
      {!rows ? <LoadingBlock /> : rows.length === 0 ? <Empty>No payments yet.</Empty> : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] tracking-widest text-ink-300 uppercase">
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">User</th>
                  <th className="text-left px-4 py-3">Plan</th>
                  <th className="text-left px-4 py-3">Stars</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Date</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-[11px] text-ink-300 max-w-[160px] truncate">{p.id}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">{p.user_id}</td>
                    <td className="px-4 py-3"><Badge>{p.plan_label}</Badge></td>
                    <td className="px-4 py-3 font-semibold inline-flex items-center gap-1">{p.stars}<Star className="h-3.5 w-3.5 fill-brand-400 text-brand-400" /></td>
                    <td className="px-4 py-3 hidden md:table-cell text-ink-300 text-[12px]">{new Date(p.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge tone={p.status === "success" ? "success" : p.status === "failed" ? "danger" : "default"}>{p.status}</Badge>
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
