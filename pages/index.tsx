// pages/index.tsx
import fs from "fs/promises";
import path from "path";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";

import type { Place } from "@/lib/types";
import PlaceRow from "@/components/PlaceRow";
import MapView from "@/components/MapView";

/** ---------- Types for flexible data shapes ---------- */
type DBEntry = {
  slug?: string;
  name: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  category?: string | null;
  image?: string | null;
  image_url?: string | null; // legacy
  imageUrl?: string | null;  // camelCase
  google_url?: string | null;
  yelp_url?: string | null;
  website?: string | null;
  opens_at?: string | null;
  closes_at?: string | null;
};
type DBObject = Record<string, DBEntry>;
type DBArray = DBEntry[];
type DBAny = DBObject | DBArray;

/** ---------- Utility: slugify if one isn’t provided ---------- */
function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** ---------- Utility: check if a path exists ---------- */
async function exists(p: string) {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

/** ---------- Try to read the first existing JSON file ---------- */
async function readFirstDataFile(projectRoot: string): Promise<DBAny | null> {
  const candidates = [
    ["data", "places.json"],
    ["public", "data", "places.json"],
    ["data", "venues_media.json"],
    ["data", "venues.json"],
  ];

  for (const parts of candidates) {
    const fp = path.join(projectRoot, ...parts);
    if (await exists(fp)) {
      const raw = await fs.readFile(fp, "utf8");
      try {
        return JSON.parse(raw) as DBAny;
      } catch {
        // keep trying the next candidate
      }
    }
  }
  return null;
}

/** ---------- Find the best image for a slug ---------- */
const IMG_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

async function findLocalImageForSlug(projectRoot: string, slug: string) {
  // 1) /public/media/<slug>/cover.*
  let dir = path.join(projectRoot, "public", "media", slug);
  if (await exists(dir)) {
    for (const ext of IMG_EXTS) {
      const cand = path.join(dir, "cover" + ext);
      if (await exists(cand)) return `/media/${slug}/cover${ext}`;
    }
    // otherwise first image file in the folder
    try {
      const files = await fs.readdir(dir);
      const first = files.find((f) => IMG_EXTS.some((e) => f.toLowerCase().endsWith(e)));
      if (first) return `/media/${slug}/${first}`;
    } catch {}
  }

  // 2) /public/places/<slug>/cover.*
  dir = path.join(projectRoot, "public", "places", slug);
  if (await exists(dir)) {
    for (const ext of IMG_EXTS) {
      const cand = path.join(dir, "cover" + ext);
      if (await exists(cand)) return `/places/${slug}/cover${ext}`;
    }
    try {
      const files = await fs.readdir(dir);
      const first = files.find((f) => IMG_EXTS.some((e) => f.toLowerCase().endsWith(e)));
      if (first) return `/places/${slug}/${first}`;
    } catch {}
  }

  // 3) /public/images/<slug>/cover.* or first file
  dir = path.join(projectRoot, "public", "images", slug);
  if (await exists(dir)) {
    for (const ext of IMG_EXTS) {
      const cand = path.join(dir, "cover" + ext);
      if (await exists(cand)) return `/images/${slug}/cover${ext}`;
    }
    try {
      const files = await fs.readdir(dir);
      const first = files.find((f) => IMG_EXTS.some((e) => f.toLowerCase().endsWith(e)));
      if (first) return `/images/${slug}/${first}`;
    } catch {}
  }

  return null;
}

/** ---------- Adapt any record into our shared Place type ---------- */
function toPlace(slug: string, m: DBEntry): Place {
  const lat =
    typeof m.lat === "number"
      ? m.lat
      : typeof m.latitude === "number"
      ? m.latitude
      : null;

  const lng =
    typeof m.lng === "number"
      ? m.lng
      : typeof m.longitude === "number"
      ? m.longitude
      : null;

  const base: Place = {
    id: slug,
    name: m.name,
    address: m.address ?? null,
    category: m.category ?? null,

    // primary fields our components use
    lat,
    lng,

    imageUrl: m.image_url ?? m.imageUrl ?? m.image ?? null,
    links: {
      google: m.google_url ?? null,
      yelp: m.yelp_url ?? null,
      website: m.website ?? null,
      tiktokSearch: null,
    },
    opens_at: m.opens_at ?? null,
    closes_at: m.closes_at ?? null,
    subcategories: [],
    dogFriendly: "unknown",
  };

  // Add legacy fields ONLY if present
  if (lat !== null) base.latitude = lat;
  if (lng !== null) base.longitude = lng;

  return base;
}


/** ---------- getStaticProps: read data + enrich with local images ---------- */
export async function getStaticProps() {
  const projectRoot = process.cwd();
  const raw = await readFirstDataFile(projectRoot);

  let places: Place[] = [];
  if (raw) {
    if (Array.isArray(raw)) {
      places = raw.map((entry) => {
        const slug = entry.slug ? entry.slug : slugify(entry.name);
        return toPlace(slug, entry);
      });
    } else {
      const obj = raw as DBObject;
      places = Object.entries(obj).map(([slug, entry]) => toPlace(slug || slugify(entry.name), entry));
    }
  }

  // fill in imageUrl from local photo folders if available
  for (const p of places) {
    if (!p.imageUrl && p.id) {
      const local = await findLocalImageForSlug(projectRoot, String(p.id));
      if (local) p.imageUrl = local;
    }
  }

  // stable ordering
  places.sort((a, b) => a.name.localeCompare(b.name));

  return {
    props: { places },
    // If you plan to change JSON often, enable ISR:
    // revalidate: 60,
  };
}

/** ---------- Client page (list ↔ map, search, filter) ---------- */
type View = "list" | "map";

export default function Home({ places }: { places: Place[] }) {
  const [view, setView] = useState<View>("list");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number }>({
    lat: 42.3314,
    lng: -83.0458,
  });

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    places.forEach((p) => p.category && set.add(p.category));
    return ["All", ...Array.from(set).sort()];
  }, [places]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return places.filter((p) => {
      const catOk = cat === "All" || (p.category ?? "").toLowerCase() === cat.toLowerCase();
      const qOk =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.address ?? "").toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [places, query, cat]);

  return (
    <>
      <Head><title>doggo-now</title></Head>
      <main className="mx-auto max-w-6xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold">Venues</h1>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, address, category…"
              className="w-full sm:w-72 rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="w-full sm:w-48 rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="inline-flex overflow-hidden rounded-lg border border-zinc-800">
              <button
                onClick={() => setView("list")}
                className={`px-3 py-2 text-sm ${view === "list" ? "bg-zinc-800 text-white" : "text-zinc-300"}`}
              >
                List
              </button>
              <button
                onClick={() => setView("map")}
                className={`px-3 py-2 text-sm ${view === "map" ? "bg-zinc-800 text-white" : "text-zinc-300"}`}
              >
                Map
              </button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-sm text-zinc-400">
            No results. Add/update <code className="rounded bg-zinc-800 px-1 py-0.5">data/places.json</code> (or
            <code className="rounded bg-zinc-800 px-1 py-0.5">public/data/places.json</code> / <code className="rounded bg-zinc-800 px-1 py-0.5">data/venues_media.json</code>).
          </div>
        ) : view === "list" ? (
          <ul className="space-y-3">
            {filtered.map((p) => (
              <PlaceRow key={p.id ?? p.name} place={p} />
            ))}
          </ul>
        ) : (
          <MapView places={filtered as any} userLoc={userLoc} />
        )}
      </main>
    </>
  );
}
