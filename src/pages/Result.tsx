import { CheckCircle2, XCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "../components/ui";

export default function Result({ kind, onHome, onRetry, message }: {
  kind: "success" | "error"; onHome: () => void; onRetry?: () => void; message?: string;
}) {
  const ok = kind === "success";
  const Icon = ok ? CheckCircle2 : XCircle;
  return (
    <div className="flex flex-col items-center justify-center text-center gap-6 py-10 sm:py-20">
      <div className="relative">
        <div className={`absolute inset-0 blur-3xl rounded-full scale-150 ${ok ? "bg-emerald-500/30" : "bg-red-500/30"}`} />
        <div className={`relative h-28 w-28 sm:h-32 sm:w-32 rounded-[2rem] grid place-items-center ${ok ? "bg-gradient-to-br from-emerald-400 to-emerald-700" : "bg-gradient-to-br from-red-400 to-red-700"} shadow-2xl`}>
          <Icon className="h-14 w-14 sm:h-16 sm:w-16 text-white" />
        </div>
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{ok ? "Payment successful" : "Payment failed"}</h1>
        <p className="text-sm text-ink-300">{ok
          ? "Your subscription is now active. Open your profile to view channels and subscription details."
          : (message ?? "Something went wrong. You can try again or go back home.")}</p>
      </div>
      <div className="flex gap-3">
        {!ok && onRetry && <Button onClick={onRetry} variant="outline"><RefreshCw className="h-4 w-4"/>Try again</Button>}
        <Button onClick={onHome}><Home className="h-4 w-4"/>{ok ? "View profile" : "Back home"}</Button>
      </div>
    </div>
  );
}
