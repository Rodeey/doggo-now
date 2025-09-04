import type { Place } from "@/lib/types";
import { isOpenNow } from "@/lib/isOpenNow";
import { MapPin, ExternalLink, Dog, Clock } from "lucide-react";
import { useMemo } from "react";

type Props = {
  place: Place;
  userLoc?: { lat:number; lng:number } | null;
};

function formatAddress(addr: string | null) {
  return addr || "—";
}

function buildTikTokSearch(name: string, city?: string | null, state?: string | null) {
  const q = encodeURIComponent(`${name} ${city || "Detroit"} ${state || "MI"}`);
  return `https://www.tiktok.com/search?q=${q}`;
}

function buildYelpSearch(name: string, city?: string | null, state?: string | null) {
  const qn = encodeURIComponent(name);
  const loc = encodeURIComponent(`${city || "Detroit"}, ${state || "MI"}`);
  return `https://www.yelp.com/search?find_desc=${qn}&find_loc=${loc}`;
}

export default function PlaceCardRow({ place }: Props) {
  const openNow = useMemo(() => isOpenNow(place.opens_at, place.closes_at, { timeZone: "America/Detroit" }), [place.opens_at, place.closes_at]);

  const img = place.imageUrl || "/media/placeholder.jpg";
  const tiktok = place.links.tiktokSearch || buildTikTokSearch(place.name, place.city, place.state);
  const yelp = place.links.yelp || buildYelpSearch(place.name, place.city, place.state);
  const maps = place.links.google || (place.lat && place.lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`
  );
  const site = place.links.website;

  return (
    <div className="card flex gap-3 p-3">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-neutral-800">
        <img src={img} alt={place.name} className="h-full w-full object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3">
          <h3 className="truncate text-base font-semibold">{place.name}</h3>
          <span className={`pill ${openNow ? "border-green-600 text-green-300 bg-green-500/10" : "border-red-600 text-red-300 bg-red-500/10"}`}>
            <Clock size={14} />
            {openNow ? "Open now" : "Closed"}
          </span>
        </div>
        <div className="mt-1 text-sm text-neutral-400">{formatAddress(place.address)}</div>
        <div className="mt-2 flex flex-wrap gap-2">
          <a className="pill border-blue-600 bg-blue-500/10 text-blue-300" href={maps} target="_blank" rel="noreferrer">
            <MapPin size={14} /> Directions
          </a>
          <a className="pill border-pink-600 bg-pink-500/10 text-pink-300" href={yelp} target="_blank" rel="noreferrer">
            <ExternalLink size={14} /> Yelp
          </a>
          <a className="pill border-purple-600 bg-purple-500/10 text-purple-300" href={tiktok} target="_blank" rel="noreferrer">
            <ExternalLink size={14} /> TikTok
          </a>
          {site && (
            <a className="pill border-zinc-600 bg-zinc-500/10 text-zinc-300" href={site} target="_blank" rel="noreferrer">
              <ExternalLink size={14} /> Website
            </a>
          )}
          {place.dogFriendly === "yes" && (
            <span className="pill border-emerald-600 bg-emerald-500/10 text-emerald-300">
              <Dog size={14} /> Dog friendly
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
