// components/PlaceRow.tsx
import { useMemo } from "react";
import { Place } from "@/lib/types";
import { isOpenNow } from "@/lib/isOpenNow";
import { MapPin, ExternalLink } from "lucide-react";

/** Helpers */
function toGoogleMapsUrl(name: string, address?: string | null) {
  const q = encodeURIComponent(`${name} ${address ?? ""}`.trim());
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function toYelpUrl(name: string, cityState = "Detroit, MI") {
  return `https://www.yelp.com/search?find_desc=${encodeURIComponent(
    name
  )}&find_loc=${encodeURIComponent(cityState)}`;
}

function toTikTok(name: string, address?: string | null) {
  const parts = (address || "").split(",").map((s) => s.trim());
  const city = parts.length >= 2 ? parts[parts.length - 2] : "Detroit";
  const state = (parts[parts.length - 1] || "").match(/\b[A-Z]{2}\b/)?.[0] || "MI";
  const q = encodeURIComponent(`${name} ${city} ${state}`);
  return `https://www.tiktok.com/search?q=${q}`;
}

export default function PlaceRow({ place }: { place: Place }) {
  // boolean, guarded for missing times
  const openNow = useMemo(
    () =>
      typeof place.opens_at === "string" && typeof place.closes_at === "string"
        ? isOpenNow(place.opens_at, place.closes_at)
        : false,
    [place.opens_at, place.closes_at]
  );

  // Support both legacy fields and the new shape
  const imageSrc =
    (place as any).image_url ?? place.imageUrl ?? "/placeholder.png";
  const googleUrl =
    (place as any).google_url ?? place.links?.google ?? toGoogleMapsUrl(place.name, place.address);
  const yelpUrl =
    (place as any).yelp_url ?? place.links?.yelp ?? toYelpUrl(place.name);
  const tiktokUrl =
    place.links?.tiktokSearch ?? toTikTok(place.name, place.address);

  return (
    <li className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:bg-gray-900/50 transition border-b border-gray-800 last:border-b-0">
      {/* Thumbnail */}
      <img
        src={imageSrc}
        alt={place.name}
        className="w-full sm:w-32 h-24 rounded-lg object-cover flex-shrink-0"
      />

      {/* Content */}
      <div className="flex-1 min-w-0 w-full">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h3 className="font-semibold truncate">{place.name}</h3>
          {place.category ? (
            <span className="text-xs rounded-full bg-gray-700/70 px-2 py-0.5">
              {place.category}
            </span>
          ) : null}
          <span
            className={`text-xs rounded-full px-2 py-0.5 ${
              openNow ? "bg-emerald-400/90 text-black" : "bg-zinc-700/70 text-white"
            }`}
          >
            {openNow ? "Open now" : "Closed"}
          </span>
        </div>

        {/* Address (distance mock removed for clarity) */}
        <p className="text-xs text-gray-400 truncate">
          {place.address || "Detroit, MI"}
        </p>

        {/* Action buttons */}
        <div className="mt-2 flex flex-wrap gap-2">
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 transition inline-flex items-center gap-1"
            title="Open in Google Maps"
          >
            <MapPin className="h-3.5 w-3.5" />
            Google
          </a>

          {yelpUrl && (
            <a
              href={yelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 transition inline-flex items-center gap-1"
              title="Open on Yelp"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Yelp
            </a>
          )}

          {tiktokUrl && (
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2 py-1 rounded bg-black text-white hover:bg-zinc-900 transition"
              title="Search on TikTok"
            >
              TikTok
            </a>
          )}
        </div>
      </div>
    </li>
  );
}
