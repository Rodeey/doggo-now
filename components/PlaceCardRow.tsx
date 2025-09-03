// components/PlaceCardRow.tsx
import Image from "next/image";
import { Navigation, Globe } from "lucide-react";
import type { CoreCat } from "../lib/categories";
import { CATEGORY_THEME } from "../lib/categories";

/** Local fallback pool (served from /public/media/dogs/) */
const FALLBACKS = [
  "/media/dogs/fallback1.jpg",
  "/media/dogs/fallback2.jpg",
  "/media/dogs/fallback3.jpg",
  "/media/dogs/fallback4.jpg",
  "/media/dogs/fallback5.jpg",
  "/media/dogs/fallback6.jpg",
  "/media/dogs/fallback7.jpg",
  "/media/dogs/fallback8.jpg",
  "/media/dogs/fallback9.jpg",
  "/media/dogs/fallback10.jpg",
  "/media/dogs/dog_bday.jpg",
  "/media/dogs/dog_chillin.jpg",
  "/media/dogs/dog_coffee.jpg",
  "/media/dogs/dog_hammock.jpg",
  "/media/dogs/dog_shades.jpg",
  "/media/dogs/dog_tongue.jpg",
  "/media/dogs/happy_dogs.jpg",
];

/** Stable hash → fallback index */
function stableIndex(key: string | number): number {
  const s = String(key);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % FALLBACKS.length;
}

/** Pick best image (custom → remote → fallback pool) */
function pickImage({
  id,
  name,
  image,
  image_url,
}: {
  id?: string | number;
  name: string;
  image?: string | null;
  image_url?: string | null;
}) {
  const isGenericFallback = !!image && image.toLowerCase().includes("fallback");
  if (image && !isGenericFallback) return image;
  if (image_url) return image_url;
  return FALLBACKS[stableIndex(id ?? name)];
}

/** Build fallback URLs if missing in data */
function toMaps(name: string, address?: string | null) {
  const q = encodeURIComponent(`${name} ${address ?? ""}`.trim());
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
function parseCityState(address?: string | null) {
  if (!address) return { city: "Detroit", state: "MI" };
  const parts = address.split(",").map((p) => p.trim());
  const city = parts.length >= 2 ? parts[parts.length - 2] : "Detroit";
  const state = (parts[parts.length - 1] || "").match(/\b[A-Z]{2}\b/)?.[0] || "MI";
  return { city, state };
}
function toYelp(name: string, address?: string | null) {
  const { city, state } = parseCityState(address);
  const q = encodeURIComponent(name);
  const loc = encodeURIComponent(`${city}, ${state}`);
  return `https://www.yelp.com/search?find_desc=${q}&find_loc=${loc}`;
}
/** TikTok search helper (falls back to Detroit, MI) */
function toTikTok(name: string, address?: string | null) {
  const { city, state } = parseCityState(address);
  const q = encodeURIComponent(`${name} ${city} ${state}`);
  return `https://www.tiktok.com/search?q=${q}`;
}

// ---------------------
// Types
// ---------------------
type Place = {
  id?: string | number;
  name: string;
  category?: CoreCat | string | null;
  image?: string | null;
  image_url?: string | null;
  tags?: string[];
  distanceMiles?: number | null;
  isOpenNow?: boolean;
  googleMapsUrl?: string | null;
  yelpUrl?: string | null;
  website?: string | null;
  address?: string | null;
};

// ---------------------
// Component
// ---------------------
export default function PlaceCardRow({
  id,
  name,
  category,
  image,
  image_url,
  tags = [],
  distanceMiles,
  isOpenNow,
  googleMapsUrl,
  yelpUrl,
  website,
  address,
}: Place) {
  const imgSrc = pickImage({ id, name, image, image_url });
  const mapsHref = googleMapsUrl && googleMapsUrl.startsWith("http") ? googleMapsUrl : toMaps(name, address);
  const yelpHref = yelpUrl && yelpUrl.startsWith("http") ? yelpUrl : toYelp(name, address);
  const tiktokHref = toTikTok(name, address);

  const theme = CATEGORY_THEME[(category as CoreCat) || "Restaurant"];

  return (
    <article className="grid grid-cols-[auto,1fr,auto] items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 shadow-sm ring-1 ring-black/10 transition hover:shadow-md">
      {/* avatar (now links to TikTok with a tiny hover tooltip) */}
      <div className="flex items-center">
        <a
          href={tiktokHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block"
          title="Search on TikTok"
        >
          <Image
            src={imgSrc}
            alt={name}
            width={56}
            height={56}
            quality={90}
            className="rounded-full object-cover"
          />
          {/* tiny tooltip */}
          <span
            className="pointer-events-none absolute left-1/2 top-full z-10 -translate-x-1/2 translate-y-1 opacity-0 rounded-md bg-black px-2 py-0.5 text-[10px] font-medium text-white shadow-sm transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          >
            TikTok
          </span>
        </a>
      </div>

      {/* content */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-base font-semibold text-white">{name}</h3>

          {/* category pill (colored) */}
          {category && (
            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${theme.pill.base} ${theme.pill.border} ${theme.pill.text}`}
            >
              {category}
            </span>
          )}

          {/* distance + open badges */}
          {typeof distanceMiles === "number" && (
            <span className="shrink-0 rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs text-zinc-200">
              {distanceMiles.toFixed(1)} mi
            </span>
          )}
          {typeof isOpenNow === "boolean" && (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                isOpenNow
                  ? "border border-emerald-700 bg-emerald-500/15 text-emerald-300"
                  : "border border-zinc-700 bg-zinc-800 text-zinc-300"
              }`}
            >
              {isOpenNow ? "Open now" : "Closed"}
            </span>
          )}
        </div>

        <div className="mt-1 truncate text-xs text-zinc-300">
          {category || "—"} {address ? `• ${address}` : ""}
        </div>

        {tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-200"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* actions rail */}
      <div className="ml-2 flex items-center gap-2">
        {/* Directions */}
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-200 hover:bg-zinc-700/60"
          title="Get directions"
        >
          <Navigation className="h-4 w-4" />
          <span className="hidden sm:inline">Directions</span>
        </a>

        {/* Yelp (red logo) */}
        <a
          href={yelpHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#d32323] px-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#a51c1c]"
          title="Open on Yelp"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-4 w-4 fill-current"
            aria-hidden="true"
          >
            <path d="M21.77 16.67c-.11-.26-.37-.44-.66-.44l-4.97-.37c-.3 0-.57.17-.68.44l-1.96 4.72c-.11.26-.06.56.13.77.19.21.47.3.74.25l4.97-1c.29-.06.51-.28.58-.56l1.66-5.07c.05-.19.05-.4-.08-.54ZM14.6 12.86c.27.08.56-.02.73-.25l2.89-4.18c.16-.23.18-.54.05-.79s-.37-.41-.64-.41l-5.54.25c-.29.01-.55.2-.65.47l-2.04 5.34c-.1.27-.03.58.19.78.22.2.53.26.8.16l4.21-1.37ZM9.5 10.77c.23-.18.33-.47.27-.75L8.37 4.9c-.05-.28-.25-.5-.52-.59-.27-.09-.57-.02-.77.18L3.51 8.18c-.2.2-.26.5-.16.76.1.26.34.45.61.49l5.54.78c.27.04.54-.05.72-.24ZM9.22 13.32l-5.4 1.67c-.27.09-.47.31-.51.6-.05.28.07.56.3.72l4.42 3.15c.23.16.54.19.8.07.26-.12.44-.36.46-.64l.28-4.82c.02-.29-.13-.57-.35-.75ZM20.03 3.44c-.2-.2-.5-.27-.77-.18L13.74 5c-.27.09-.47.31-.51.6-.05.28.07.56.3.72l3.94 2.81c.23.16.54.19.8.07.26-.12.44-.36.46-.64l.28-4.82c.02-.28-.09-.57-.29-.77Z" />
          </svg>
          <span className="hidden sm:inline">Yelp</span>
        </a>

        {/* TikTok */}
        <a
          href={tiktokHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-black px-3 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-900"
          title="Search on TikTok"
        >
          {/* TikTok logo (white) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="h-4 w-4 fill-current"
            aria-hidden="true"
          >
            <path d="M31.5 10.2c1.8 2 4.2 3.4 7 3.7v6.1c-2.6-.1-5-1-7-2.4v10.1c0 6.2-5 11.2-11.2 11.2S9 33.9 9 27.7c0-6.2 5-11.2 11.2-11.2 1 0 2 .1 2.9.4v6.3a5.1 5.1 0 0 0-2.9-.9 5 5 0 1 0 5 5V6h6.3v4.2Z"/>
          </svg>
          <span className="hidden sm:inline">TikTok</span>
        </a>

        {/* Website (blue pill) */}
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-full bg-blue-600 px-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500"
            title="Open website"
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Website</span>
          </a>
        )}
      </div>
    </article>
  );
}
