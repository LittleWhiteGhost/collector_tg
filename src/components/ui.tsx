import type { ReactNode } from "react";

export function Card({ children, className = "", padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <div className={`glass ${padded ? "p-5 sm:p-6" : ""} ${className}`}>{children}</div>
  );
}

export function Section({ title, kicker, actions, children }: {
  title: string; kicker?: string; actions?: ReactNode; children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <header className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <div>
          {kicker && <p className="text-[10px] tracking-[0.3em] text-brand-400 font-semibold uppercase">{kicker}</p>}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">{title}</h1>
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="glass p-4 sm:p-5">
      <p className="text-[10px] tracking-[0.25em] text-ink-300 uppercase">{label}</p>
      <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white">{value}</p>
      {hint && <p className="text-[11px] text-ink-300 mt-1">{hint}</p>}
    </div>
  );
}

export function Button({ children, onClick, variant = "solid", className = "", disabled, type = "button" }: {
  children: ReactNode; onClick?: () => void; variant?: "solid" | "ghost" | "danger" | "outline";
  className?: string; disabled?: boolean; type?: "button" | "submit" | "reset";
}) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold tracking-wide transition disabled:opacity-40 disabled:cursor-not-allowed";
  const v =
    variant === "solid"  ? "cta-gradient text-white shadow-lg shadow-brand-500/20 hover:brightness-110 active:brightness-95" :
    variant === "ghost"  ? "bg-white/5 text-white hover:bg-white/10" :
    variant === "danger" ? "bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/20" :
                            "border border-white/15 text-white hover:bg-white/5";
  return <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${v} ${className}`}>{children}</button>;
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "accent" | "success" | "danger" }) {
  const t =
    tone === "accent"  ? "bg-brand-500 text-white" :
    tone === "success" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20" :
    tone === "danger"  ? "bg-red-500/15 text-red-300 border border-red-500/20" :
                         "bg-white/5 text-ink-100 border border-white/10";
  return <span className={`inline-flex items-center px-2 py-[3px] rounded-full text-[10px] font-semibold tracking-widest uppercase ${t}`}>{children}</span>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-[0.25em] text-ink-300 uppercase mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-ink-300 focus:outline-none focus:border-brand-500 transition ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-ink-300 focus:outline-none focus:border-brand-500 transition ${props.className ?? ""}`}
    />
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="glass p-8 text-center text-ink-300 text-sm">{children}</div>;
}

export function LoadingBlock() {
  return <div className="glass p-6 text-center text-ink-300 text-sm tracking-widest uppercase animate-pulse">Loading…</div>;
}

export function ErrorBlock({ children }: { children: ReactNode }) {
  return <div className="glass p-5 text-red-300 text-sm border border-red-500/20">{children}</div>;
}
