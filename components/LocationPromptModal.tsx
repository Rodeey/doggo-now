import { useEffect, useState } from "react";

type Props = {
  onConfirm: (loc: {lat:number, lng:number} | null) => void;
};

export default function LocationPromptModal({ onConfirm }: Props) {
  const [show, setShow] = useState(true);
  const [loading, setLoading] = useState(false);

  const detroit = { lat: 42.3314, lng: -83.0458 };

  const handleUseLocation = () => {
    setLoading(true);
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setShow(false);
          onConfirm({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          setShow(false);
          onConfirm(detroit);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setShow(false);
      onConfirm(detroit);
    }
  };

  const handleDetroit = () => {
    setShow(false);
    onConfirm(detroit);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[90%] max-w-md rounded-xl bg-white p-6 text-black shadow-xl">
        <h2 className="mb-4 text-xl font-semibold">See what’s happening near you right now!</h2>
        <div className="flex justify-center gap-3">
          <button
            className="rounded-lg bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800"
            onClick={handleUseLocation}
            disabled={loading}
          >
            {loading ? "Locating…" : "Use my location"}
          </button>
          <button
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-900 hover:bg-neutral-50"
            onClick={handleDetroit}
          >
            Try Detroit demo
          </button>
        </div>
      </div>
    </div>
  );
}
