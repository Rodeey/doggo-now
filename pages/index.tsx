import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import LocationPromptModal from "@/components/LocationPromptModal";
import CategoryChips from "@/components/CategoryChips";
import PlaceCardRow from "@/components/PlaceCardRow";
import MapView from "@/components/MapView";
import { isOpenNow } from "@/lib/isOpenNow";
import type { Place, CoreCat } from "@/lib/types";
import localPlaces from "@/data/places.json";
import { supabase } from "@/lib/supabase"; // NEW

type ViewMode = "list" | "map";

export default function HomePage() {
  // View & interaction state (unchanged)
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<CoreCat | "All">("All");
  const [view, setView] = useState<ViewMode>("list");

  // === SOURCE OF TRUTH: places ===
  // Start with local JSON so we always render; then upgrade to Supabase if it returns rows.
  const [places, setPlaces] = useState<Place[]>(
    Array.isArray(localPlaces) ? (localPlaces as any as Place[]) : []
  );

  // Fetch from Supabase (read-only; preserves all downstream behavior)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("places")
          .select(
            "id,name,address,city,state,lat,lng,category,opens_at,closes_at,google_url,yelp_url,website,subcategories"
          )
          .order("id", { ascending: true })
          .limit(1000);

        if (error) throw error;
        if (!mounted || !data || data.length === 0) return;

        // Normalize to Place (keep current contracts intact)
        const normalized: Place[] = data.map((r: any) => ({
          // id now numeric per your schema change
          id: typeof r.id === "number" ? r.id : Number(r.id),
          name: r.name ?? "",
          address: r.address ?? null,
          city: r.city ?? null,
          state: r.state ?? null,
          category: r.category ?? null,
          lat:
            r.lat === null || r.lat === undefined || r.lat === ""
              ? null
              : Number(r.lat),
          lng:
            r.lng === null || r.lng === undefined || r.lng === ""
              ? null
              : Number(r.lng),
          imageUrl: null, // still using a placeholder in the row component for V1
          opens_at: r.opens_at ?? null,
          closes_at: r.closes_at ?? null,
          links: {
            google: r.google_url ?? null,
            yelp: r.yelp_url ?? null,
            website: r.website ?? null,
            tiktokSearch: null,
          },
          // Accept either text[] or string like "{A,B}" from CSV; normalize to string[]
          subcategories: Array.isArray(r.subcategories)
            ? r.subcategories
            : typeof r.subcategories === "string" && r.subcategories.trim().startsWith("{")
            ? r.subcategories
                .replace(/[{}]/g, "")
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)
            : [],
          dogFriendly: "yes", // site-wide default (we don't show a pill)
        }));

        setPlaces(normalized);
      } catch (e) {
        // Quietly keep local JSON if Supabase fetch fails
        console.warn("Supabase fetch failed; using local data", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // === FILTER PIPELINE (unchanged order) ===

  // 1) open now (Detroit)
  const openNow = useMemo(() => {
    return places.filter((p) =>
      isOpenNow(p.opens_at, p.closes_at, { timeZone: "America/Detroit" })
    );
  }, [places]);

  // 2) search
  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return openNow;
    return openNow.filter((p) => {
      const hay = [
        p.name,
        p.address,
        p.category,
        ...(p.subcategories || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [openNow, query]);

  // 3) category
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
          {/* IMPORTANT: CategoryChips still gets the 'searched' list */}
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
              <PlaceCardRow key={p.id} place={p} userLoc={userLoc} />
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
