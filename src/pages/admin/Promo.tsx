import { useEffect, useState } from "react";
import { Plus, Trash2, Power, Edit3, Save, X, Tag, Copy } from "lucide-react";
import { api, type PromoCode, type PromoCodeIn, type Plan } from "../../api";
import { Badge, Button, Card, Empty, ErrorBlock, Field, Input, LoadingBlock, Section, Select, TextArea } from "../../components/ui";

const EMPTY: PromoCodeIn = {
  code: "",
  description: "",
  discount_percent: 30,
  plan_id: "any",
  max_uses: 0,
  expires_at: null,
  active: true,
};

export default function AdminPromo() {
  const [rows, setRows] = useState<PromoCode[] | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [form, setForm] = useState<PromoCodeIn>(EMPTY);

  const load = async () => {
    try {
      const [p, all] = await Promise.all([api.adminListPromo(), api.adminListPlans().catch(() => [])]);
      setRows(p);
      setPlans(all);
      setErr(null);
    } catch (e) { setErr(String(e)); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditingCode(null); setCreating(true); };
  const openEdit = (p: PromoCode) => {
    setEditingCode(p.code); setCreating(true);
    setForm({
      code: p.code,
      description: p.description,
      discount_percent: p.discount_percent,
      plan_id: p.plan_id,
      max_uses: p.max_uses,
      expires_at: p.expires_at,
      active: p.active,
    });
  };
  const cancel = () => { setCreating(false); setEditingCode(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCode) {
        const { code: _c, ...patch } = form; void _c;
        await api.adminUpdatePromo(editingCode, patch);
      } else {
        await api.adminCreatePromo({ ...form, code: form.code.toUpperCase() });
      }
      cancel(); await load();
    } catch (ex) { alert(String(ex)); }
  };

  const toggle = async (code: string) => { try { await api.adminTogglePromo(code); await load(); } catch (e) { alert(String(e)); } };
  const del    = async (code: string) => { if (!confirm(`Delete code ${code}?`)) return; try { await api.adminDeletePromo(code); await load(); } catch (e) { alert(String(e)); } };

  const copy = (s: string) => { navigator.clipboard.writeText(s).catch(() => {}); };

  return (
    <Section
      kicker="Admin · Promo codes"
      title="Promo Code Management"
      actions={<Button onClick={openCreate}><Plus className="h-4 w-4"/>New code</Button>}
    >
      {creating && (
        <Card>
          <form onSubmit={submit} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{editingCode ? `Edit ${editingCode}` : "New promo code"}</h3>
              <button type="button" onClick={cancel} className="text-ink-300 hover:text-white"><X className="h-5 w-5"/></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Code">
                <Input
                  required
                  disabled={!!editingCode}
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="WELCOME30"
                  pattern="[A-Z0-9_\-]{2,64}"
                />
              </Field>
              <Field label="Discount %">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={form.discount_percent}
                  onChange={e => setForm({ ...form, discount_percent: Number(e.target.value) })}
                />
              </Field>
              <Field label="Applies to plan">
                <Select
                  value={form.plan_id ?? "any"}
                  onChange={e => setForm({ ...form, plan_id: e.target.value })}
                >
                  <option value="any">Any plan</option>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.label} ({p.id})</option>)}
                </Select>
              </Field>
              <Field label="Max uses (0 = unlimited)">
                <Input
                  type="number"
                  min={0}
                  value={form.max_uses ?? 0}
                  onChange={e => setForm({ ...form, max_uses: Number(e.target.value) })}
                />
              </Field>
              <Field label="Expires at (optional)">
                <Input
                  type="datetime-local"
                  value={form.expires_at ? form.expires_at.slice(0, 16) : ""}
                  onChange={e => setForm({ ...form, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                />
              </Field>
            </div>
            <Field label="Description (internal)">
              <TextArea
                rows={2}
                value={form.description ?? ""}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Launch week — 30% off first month"
              />
            </Field>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.active ?? true}
                  onChange={e => setForm({ ...form, active: e.target.checked })}
                  className="accent-brand-500"
                /> Active
              </label>
              <div className="ml-auto flex gap-2">
                <Button type="button" variant="ghost" onClick={cancel}>Cancel</Button>
                <Button type="submit"><Save className="h-4 w-4"/>{editingCode ? "Save changes" : "Create"}</Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {err && <ErrorBlock>{err}</ErrorBlock>}
      {!rows ? <LoadingBlock /> : rows.length === 0 ? (
        <Empty>No promo codes yet. Create one to offer a discount.</Empty>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-[11px] tracking-widest uppercase text-ink-300">
              <tr>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Discount</th>
                <th className="text-left px-4 py-3">Plan</th>
                <th className="text-left px-4 py-3">Uses</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Expires</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(p => (
                <tr key={p.code} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-brand-400 shrink-0" />
                      <span className="font-bold tracking-wider">{p.code}</span>
                      <button onClick={() => copy(p.code)} title="Copy" className="text-ink-300 hover:text-white">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {p.description && <p className="text-[11px] text-ink-300 mt-0.5 truncate max-w-[260px]">{p.description}</p>}
                  </td>
                  <td className="px-4 py-3 font-bold text-brand-300">-{p.discount_percent}%</td>
                  <td className="px-4 py-3">
                    <Badge tone={p.plan_id === "any" ? "neutral" : "accent"}>
                      {p.plan_id === "any" ? "ANY" : p.plan_id.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {p.used_count}{p.max_uses > 0 ? ` / ${p.max_uses}` : ""}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-ink-300">
                    {p.expires_at ? new Date(p.expires_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={p.active ? "accent" : "neutral"}>{p.active ? "ACTIVE" : "OFF"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(p)} title="Edit" className="p-2 rounded-lg hover:bg-white/5 text-ink-300 hover:text-white">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button onClick={() => toggle(p.code)} title="Toggle" className="p-2 rounded-lg hover:bg-white/5 text-ink-300 hover:text-white">
                        <Power className="h-4 w-4" />
                      </button>
                      <button onClick={() => del(p.code)} title="Delete" className="p-2 rounded-lg hover:bg-white/5 text-red-400 hover:text-red-300">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </Section>
  );
}
