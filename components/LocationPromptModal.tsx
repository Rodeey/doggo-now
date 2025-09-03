// components/LocationPromptModal.tsx
import { useEffect, useState } from "react";
import { MapPin, ShieldCheck } from "lucide-react";

type Props = {
  onConfirm: () => void;   // user taps Share your location
  onSkip?: () => void;     // user taps Skip for now (optional)
};

export default function LocationPromptModal({ onConfirm, onSkip }: Props) {
  const [show, setShow] = useState(true);

  // ESC to close (treat as skip)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShow(false);
        onSkip?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSkip]);

  const handleConfirm = () => {
    setShow(false);
    onConfirm();
  };
  const handleSkip = () => {
    setShow(false);
    onSkip?.();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {/* Card */}
      <div
        className="w-[92%] max-w-md rounded-2xl border border-emerald-600/30 bg-gradient-to-b from-zinc-900 to-zinc-950 p-5 text-zinc-100 shadow-2xl ring-1 ring-black/20"
        role="dialog"
        aria-modal="true"
        aria-labelledby="loc-modal-title"
      >
        {/* Header */}
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
            <MapPin className="h-5 w-5 text-emerald-400" />
          </div>
          <h2 id="loc-modal-title" className="text-lg font-semibold tracking-tight">
            See what’s happening near you right now!
          </h2>
        </div>

        {/* Body */}
        <p className="mb-4 text-sm text-zinc-300">
          Share your location to sort places by distance and show what’s open nearby.
        </p>

        {/* Privacy note */}
        <div className="mb-5 flex items-center gap-2 text-xs text-zinc-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>We only use your location to rank results. Nothing is saved.</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleConfirm}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-black shadow-md transition hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 active:scale-[0.99]"
          >
            Share your location
          </button>
          <button
            onClick={handleSkip}
            className="inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 active:scale-[0.99]"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
