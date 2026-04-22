import { Star, Sparkles, Rocket, ArrowRight, ChevronLeft } from "lucide-react";
import { Button } from "../components/ui";

const SLIDES = [
  { icon: Sparkles, title: "Own Your Access,\nShape Your Future",
    text: "Unlock exclusive private channels, curated content and premium analytics — paid natively in Telegram Stars." },
  { icon: Rocket, title: "Pay with\nTelegram Stars",
    text: "Native one-tap checkout inside Telegram. No cards, no forms, no friction." },
  { icon: Star, title: "Instant activation",
    text: "Your subscription activates the moment the payment settles. Manage it from your profile at any time." },
];

export default function Welcome({ slide, setSlide, onStart }: {
  slide: number; setSlide: (n: number) => void; onStart: () => void;
}) {
  const s = SLIDES[slide];
  const Icon = s.icon;
  const last = slide === SLIDES.length - 1;

  return (
    <div className="glow-bg min-h-screen w-full flex flex-col items-center justify-between px-6 py-10 sm:py-16">
      {/* top bar */}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <button
          onClick={() => setSlide(Math.max(0, slide - 1))}
          className={`h-10 w-10 grid place-items-center rounded-full border border-white/10 bg-white/5 transition ${slide === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === slide ? "w-7 bg-brand-500" : "w-1.5 bg-white/20"}`} />
          ))}
        </div>
        <button onClick={onStart} className="text-[11px] tracking-[0.25em] text-ink-300 uppercase hover:text-white transition">Skip</button>
      </div>

      {/* hero */}
      <div className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center gap-8 text-center">
        <div className="relative">
          <div className="absolute inset-0 blur-3xl rounded-full bg-brand-500/40 scale-150" />
          <div className="relative h-40 w-40 sm:h-52 sm:w-52 rounded-[2rem] bg-gradient-to-br from-brand-300 via-brand-500 to-brand-800 grid place-items-center shadow-2xl shadow-brand-500/40">
            <Icon className="h-20 w-20 sm:h-28 sm:w-28 text-white/95" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight whitespace-pre-line leading-[1.05]">
          {s.title}
        </h1>
        <p className="text-sm sm:text-base text-ink-100/80 max-w-md leading-relaxed">{s.text}</p>
      </div>

      {/* cta */}
      <div className="w-full max-w-md flex flex-col gap-3">
        <Button
          onClick={() => last ? onStart() : setSlide(slide + 1)}
          className="w-full py-4 text-base"
        >
          {last ? "Get started" : "Next"} <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-center text-[11px] text-ink-300 tracking-wider">
          Powered by Telegram Stars · Your subscription, your control.
        </p>
      </div>
    </div>
  );
}
