// pages/index.tsx
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import LocationPromptModal from "@/components/LocationPromptModal";
import CategoryChips from "@/components/CategoryChips";
import PlaceCardRow from "@/components/PlaceCardRow";
import MapView from "@/components/MapView";
import isOpenNow from "@/lib/isOpenNow";
import type { Place, CoreCat } from "@/lib/types";
import localPlaces from "@/data/places.json";
import { supabase } from "@/lib/supabase";

const TEST_ID = "motor-city-brewing-works";
const TEST_FROM_LOCAL = Array.isArray(localPlaces)
  ? (localPlaces as any[]).find((p) => String(p.id) === TEST_ID)
  : null;

type ViewMode = "list" | "map";

export default function HomePage() {
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<CoreCat | "All">("All");
  const [view, setView] = useState<ViewMode>("list");

  const [places, setPlaces] = useState<Place[]>(
    Array.isArray(localPlaces) ? (localPlaces as any as Place[]) : []
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (!supabase) throw new Error("Supabase client is not initialized");

        const { data, error } = await supabase
          .from("places")
          .select(
            "id,name,address,city,state,lat,lng,category,opens_at,closes_at,google_url,yelp_url,website,subcategories"
          )
          .order("id", { ascending: true })
          .limit(1000);

        if (error) throw error;
        if (!mounted || !data || data.length === 0) return;

        const normalized: Place[] = data.map((r: any) => ({
          id: typeof r.id === "number" ? r.id : String(r.id ?? ""),
          name: r.name ?? "",
          address: r.address ?? null,
          city: r.city ?? null,
          state: r.state ?? null,
          category: r.category ?? null,
          lat: r.lat == null || r.lat === "" ? null : Number(r.lat),
          lng: r.lng == null || r.lng === "" ? null : Number(r.lng),
          imageUrl: null,
          opens_at: r.opens_at ?? null,
          closes_at: r.closes_at ?? null,
          links: {
            google: r.google_url ?? null,
            yelp: r.yelp_url ?? null,
            website: r.website ?? null,
            tiktokSearch: null,
          },
          subcategories: Array.isArray(r.subcategories)
            ? r.subcategories
            : typeof r.subcategories === "string" && r.subcategories.trim().startsWith("{")
            ? r.subcategories.replace(/[{}]/g, "").split(",").map((s: string) => s.trim()).filter(Boolean)
            : [],
          dogFriendly: "yes",
        }));

        let merged = normalized;
        if (TEST_FROM_LOCAL) {
          const idx = merged.findIndex((p) => String(p.id) === TEST_ID);
          if (idx >= 0) {
            merged = [
              ...merged.slice(0, idx),
              { ...(TEST_FROM_LOCAL as any), id: TEST_ID },
              ...merged.slice(idx + 1),
            ];
          } else {
            merged = [{ ...(TEST_FROM_LOCAL as any), id: TEST_ID }, ...merged];
          }
        }

        setPlaces(merged);
      } catch (e) {
        console.warn("Supabase fetch failed; using local data", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const openNow = useMemo(() => {
    const filtered = places.filter((p) =>
      isOpenNow(p.opens_at, p.closes_at, { id: String(p.id) })
    );

    if (!filtered.some(p => String(p.id) === TEST_ID) && TEST_FROM_LOCAL) {
      return [{ ...(TEST_FROM_LOCAL as any), id: TEST_ID } as any, ...filtered];
    }

    return filtered;
  }, [places]);

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return openNow;

    return openNow.filter((p) => {
      const hay = [p.name, p.address, p.category, ...(p.subcategories || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [openNow, query]);

  const visible = useMemo(() => {
    if (selectedCat === "All") return searched;
    return searched.filter((p) => p.category === selectedCat);
  }, [searched, selectedCat]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold">
            What can you do <span className="text-brand-400">now</span> with your dog?
          </h1>
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
          <div className="mb-6 text-sm text-neutral-400">
            No matches right now. Try “All” or clear your search.
          </div>
        )}

        {view === "list" ? (
          <div className="grid gap-3">
            {visible.map((p) => (
              <PlaceCardRow key={String(p.id)} place={p} userLoc={userLoc} />
            ))}
          </div>
        ) : (
          <MapView places={visible} userLoc={userLoc} />
        )}
      </main>

      <LocationPromptModal onConfirm={(loc) => setUserLoc(loc)} />
    </div>
  );
}
