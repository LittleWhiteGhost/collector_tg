import { useEffect, useState } from "react";
import { Plus, Trash2, Power, Edit3, Save, X, Copy } from "lucide-react";
import { api, type Channel, type ChannelIn } from "../../api";
import { Badge, Button, Card, Empty, ErrorBlock, Field, Input, LoadingBlock, Section, Select, TextArea } from "../../components/ui";

const EMPTY: ChannelIn = { name: "", handle: "", description: "", plan: "basic", invite_link: "", active: true };

export default function AdminChannels() {
  const [rows, setRows] = useState<Channel[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ChannelIn>(EMPTY);

  const load = async () => {
    try { setRows(await api.adminListChannels()); setErr(null); }
    catch (e) { setErr(String(e)); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditingId(null); setCreating(true); };
  const openEdit = (c: Channel) => {
    setEditingId(c.id); setCreating(true);
    setForm({ name: c.name, handle: c.handle, description: c.description,
      plan: (c.plan as ChannelIn["plan"]) ?? "basic", invite_link: c.invite_link, active: c.active });
  };
  const cancel = () => { setCreating(false); setEditingId(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) await api.adminUpdateChannel(editingId, form);
      else await api.adminCreateChannel(form);
      cancel(); await load();
    } catch (ex) { alert(String(ex)); }
  };

  const toggle = async (id: string) => { try { await api.adminToggleChannel(id); await load(); } catch (e) { alert(String(e)); } };
  const del = async (id: string) => { if (!confirm(`Delete channel ${id}?`)) return; try { await api.adminDeleteChannel(id); await load(); } catch (e) { alert(String(e)); } };

  return (
    <Section
      kicker="Admin · Channels"
      title="Channel Management"
      actions={<Button onClick={openCreate}><Plus className="h-4 w-4"/>Add channel</Button>}
    >
      {creating && (
        <Card>
          <form onSubmit={submit} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{editingId ? `Edit channel` : "New channel"}</h3>
              <button type="button" onClick={cancel} className="text-ink-300 hover:text-white"><X className="h-5 w-5"/></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Name"><Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="VIP Alpha" /></Field>
              <Field label="Handle"><Input required value={form.handle} onChange={e => setForm({...form, handle: e.target.value})} placeholder="@vip_alpha" /></Field>
              <Field label="Invite link"><Input value={form.invite_link ?? ""} onChange={e => setForm({...form, invite_link: e.target.value})} placeholder="https://t.me/+..." /></Field>
              <Field label="Plan">
                <Select value={form.plan} onChange={e => setForm({...form, plan: e.target.value as ChannelIn["plan"]})}>
                  <option value="basic">BASIC</option><option value="pro">PRO</option>
                  <option value="elite">ELITE</option><option value="all">ALL PLANS</option>
                </Select>
              </Field>
            </div>
            <Field label="Description"><TextArea rows={3} value={form.description ?? ""} onChange={e => setForm({...form, description: e.target.value})} /></Field>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active ?? true} onChange={e => setForm({...form, active: e.target.checked})} className="accent-brand-500"/> Active
              </label>
              <div className="ml-auto flex gap-2">
                <Button type="button" variant="ghost" onClick={cancel}>Cancel</Button>
                <Button type="submit"><Save className="h-4 w-4"/>{editingId ? "Save changes" : "Create"}</Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {err && <ErrorBlock>{err}</ErrorBlock>}
      {!rows ? <LoadingBlock /> : rows.length === 0 ? <Empty>No channels yet. Create the first one.</Empty> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rows.map(c => (
            <Card key={c.id} className={c.active ? "" : "opacity-60"}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold tracking-tight truncate text-lg">{c.name}</p>
                    <Badge>{c.plan.toUpperCase()}</Badge>
                    {!c.active && <Badge tone="danger">Disabled</Badge>}
                  </div>
                  <p className="text-[11px] text-ink-300 mt-0.5 truncate">{c.handle} · {c.members} members</p>
                  {c.description && <p className="text-[12px] text-ink-100/80 mt-2 line-clamp-2">{c.description}</p>}
                  {c.invite_link && (
                    <button onClick={() => navigator.clipboard?.writeText(c.invite_link)}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300 tracking-wider">
                      <Copy className="h-3 w-3" /> {c.invite_link}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                <Button variant="ghost" onClick={() => openEdit(c)} className="text-xs py-1.5 px-3"><Edit3 className="h-3.5 w-3.5"/>Edit</Button>
                <Button variant="ghost" onClick={() => toggle(c.id)} className="text-xs py-1.5 px-3"><Power className="h-3.5 w-3.5"/>{c.active ? "Disable" : "Enable"}</Button>
                <Button variant="danger" onClick={() => del(c.id)} className="text-xs py-1.5 px-3 ml-auto"><Trash2 className="h-3.5 w-3.5"/>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
}
