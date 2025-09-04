import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import LocationPromptModal from "@/components/LocationPromptModal";
import CategoryChips from "@/components/CategoryChips";
import PlaceCardRow from "@/components/PlaceCardRow";
import MapView from "@/components/MapView";
import { isOpenNow } from "@/lib/isOpenNow";
import type { Place, CoreCat } from "@/lib/types";
import placesData from "@/data/places.json";

type ViewMode = "list" | "map";

export default function HomePage() {
  const [userLoc, setUserLoc] = useState<{lat:number; lng:number} | null>(null);
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<CoreCat | "All">("All");
  const [view, setView] = useState<ViewMode>("list");

  const places: Place[] = (placesData as any) as Place[];

  // 1) open now (Detroit)
  const openNow = useMemo(() => {
    return places.filter(p => isOpenNow(p.opens_at, p.closes_at, { timeZone: "America/Detroit" }));
  }, [places]);

  // 2) search
  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return openNow;
    return openNow.filter(p => {
      const hay = [
        p.name,
        p.address,
        p.category,
        ...(p.subcategories || [])
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [openNow, query]);

  // 3) category
  const visible = useMemo(() => {
    if (selectedCat === "All") return searched;
    return searched.filter(p => p.category === selectedCat);
  }, [searched, selectedCat]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold">What can you do <span className="text-brand-400">now</span> with your dog?</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setView("list")}
              className={`pill ${view === "list" ? "ring-2 ring-brand-500" : ""} border-zinc-600 bg-zinc-500/10 text-zinc-300`}
            >
              List
            </button>
            <button
              onClick={() => setView("map")}
              className={`pill ${view === "map" ? "ring-2 ring-brand-500" : ""} border-zinc-600 bg-zinc-500/10 text-zinc-300`}
            >
              Map
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <input
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Search by name, address, category…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <CategoryChips
            places={searched}
            selected={selectedCat}
            onChange={setSelectedCat}
          />
        </div>

        {visible.length === 0 && (
          <div className="mb-6 text-sm text-neutral-400">No matches right now. Try “All” or clear your search.</div>
        )}

        {view === "list" ? (
          <div className="grid gap-3">
            {visible.map(p => <PlaceCardRow key={p.id} place={p} userLoc={userLoc} />)}
          </div>
        ) : (
          <MapView places={visible} userLoc={userLoc} />
        )}
      </main>

      <LocationPromptModal onConfirm={(loc) => setUserLoc(loc)} />
    </div>
  );
}
