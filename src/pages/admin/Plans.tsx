import { useEffect, useState } from "react";
import { Plus, Trash2, Power, Edit3, Save, X, Star } from "lucide-react";
import { api, type Plan, type PlanIn, type PlanFeature } from "../../api";
import { Badge, Button, Card, Empty, ErrorBlock, Field, Input, LoadingBlock, Section, TextArea } from "../../components/ui";

const EMPTY: PlanIn = { id: "", label: "", stars: 99, period_days: 30, badge: "", features: [], order_index: 0, active: true };

const parseFeatures = (text: string): PlanFeature[] =>
  text.split("\n").map(l => l.trim()).filter(Boolean).map(l => {
    const [icon, ...rest] = l.split("|"); return { icon: (icon ?? "").trim(), text: rest.join("|").trim() };
  });
const featuresToText = (fs: PlanFeature[]): string =>
  fs.map(f => `${f.icon}|${f.text}`).join("\n");

export default function AdminPlans() {
  const [rows, setRows] = useState<Plan[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState<PlanIn>(EMPTY);
  const [featsText, setFeatsText] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    try { setRows(await api.adminListPlans()); setErr(null); }
    catch (e) { setErr(String(e)); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setFeatsText(""); setEditingId(null); setCreating(true); };
  const openEdit = (p: Plan) => {
    setEditingId(p.id); setCreating(true);
    setForm({ id: p.id, label: p.label, stars: p.stars, period_days: p.period_days,
      badge: p.badge ?? "", features: p.features, order_index: p.order_index ?? 0, active: p.active ?? true });
    setFeatsText(featuresToText(p.features));
  };
  const cancel = () => { setCreating(false); setEditingId(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { ...form, features: parseFeatures(featsText), badge: form.badge || null };
    try {
      if (editingId) {
        const { ...patch } = body; delete (patch as Partial<PlanIn>).id;
        await api.adminUpdatePlan(editingId, patch);
      } else {
        await api.adminCreatePlan(body);
      }
      cancel(); await load();
    } catch (ex) { alert(String(ex)); }
  };

  const toggle = async (id: string) => { try { await api.adminTogglePlan(id); await load(); } catch (e) { alert(String(e)); } };
  const del = async (id: string) => { if (!confirm(`Delete plan ${id}?`)) return; try { await api.adminDeletePlan(id); await load(); } catch (e) { alert(String(e)); } };

  return (
    <Section
      kicker="Admin · Plans"
      title="Tariff Management"
      actions={<Button onClick={openCreate}><Plus className="h-4 w-4"/>New plan</Button>}
    >
      {creating && (
        <Card>
          <form onSubmit={submit} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{editingId ? `Edit plan · ${editingId}` : "New plan"}</h3>
              <button type="button" onClick={cancel} className="text-ink-300 hover:text-white"><X className="h-5 w-5"/></button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Field label="ID"><Input required pattern="[a-z0-9_\-]+" disabled={!!editingId}
                value={form.id} onChange={e => setForm({...form, id: e.target.value})} placeholder="ultra" /></Field>
              <Field label="Label"><Input required value={form.label} onChange={e => setForm({...form, label: e.target.value})} placeholder="ULTRA" /></Field>
              <Field label="Stars (★)"><Input required type="number" min={1} value={form.stars}
                onChange={e => setForm({...form, stars: Number(e.target.value) })} /></Field>
              <Field label="Days"><Input type="number" min={1} value={form.period_days ?? 30}
                onChange={e => setForm({...form, period_days: Number(e.target.value) })} /></Field>
              <Field label="Badge (optional)"><Input value={form.badge ?? ""} onChange={e => setForm({...form, badge: e.target.value})} placeholder="POPULAR" /></Field>
              <Field label="Order"><Input type="number" value={form.order_index ?? 0}
                onChange={e => setForm({...form, order_index: Number(e.target.value)})} /></Field>
              <Field label="Active">
                <label className="flex items-center h-[42px] gap-2 text-sm"><input type="checkbox" checked={form.active ?? true} onChange={e => setForm({...form, active: e.target.checked})} className="accent-brand-500"/> Visible to users</label>
              </Field>
            </div>
            <Field label="Features · one per line · FORMAT: Icon|Text">
              <TextArea rows={6} value={featsText} onChange={e => setFeatsText(e.target.value)}
                placeholder={"Zap|PRIORITY ACCESS\nShield|ADVANCED SECURITY\nCrown|VIP STATUS"} />
            </Field>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={cancel}>Cancel</Button>
              <Button type="submit"><Save className="h-4 w-4"/>{editingId ? "Save changes" : "Create plan"}</Button>
            </div>
          </form>
        </Card>
      )}

      {err && <ErrorBlock>{err}</ErrorBlock>}
      {!rows ? <LoadingBlock /> : rows.length === 0 ? <Empty>No plans defined.</Empty> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {rows.map(p => (
            <Card key={p.id} className={p.active ? "" : "opacity-60"}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold tracking-tight">{p.label}</h3>
                    {p.badge && <Badge tone="accent">{p.badge}</Badge>}
                  </div>
                  <p className="text-[11px] text-ink-300 mt-0.5">id: {p.id} · order: {p.order_index ?? 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold inline-flex items-center gap-1">{p.stars}<Star className="h-4 w-4 fill-brand-400 text-brand-400" /></p>
                  <p className="text-[10px] text-ink-300 tracking-widest uppercase">{p.period_days}d</p>
                </div>
              </div>
              <ul className="mt-4 space-y-1 text-[12px] text-ink-100/80">
                {p.features.map((f, i) => <li key={i}>· [{f.icon}] {f.text}</li>)}
              </ul>
              <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                <Button variant="ghost" onClick={() => openEdit(p)} className="text-xs py-1.5 px-3"><Edit3 className="h-3.5 w-3.5"/>Edit</Button>
                <Button variant="ghost" onClick={() => toggle(p.id)} className="text-xs py-1.5 px-3"><Power className="h-3.5 w-3.5"/>{p.active ? "Disable" : "Enable"}</Button>
                <Button variant="danger" onClick={() => del(p.id)} className="text-xs py-1.5 px-3 ml-auto"><Trash2 className="h-3.5 w-3.5"/>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
}
