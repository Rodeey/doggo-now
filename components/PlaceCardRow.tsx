// components/PlaceCardRow.tsx
import type { Place } from "@/lib/types";
import isOpenNow from "@/lib/isOpenNow";
import { MapPin, ExternalLink, Clock, X } from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";
import { haversineMiles } from "@/lib/distance";
import { embeddedVideos } from "@/lib/embeddedVideos";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

type Props = {
  place: Place;
  userLoc?: { lat: number; lng: number } | null;
};

function buildTikTokSearch(name: string, city?: string | null, state?: string | null) {
  const q = encodeURIComponent(`${name} ${city || "Detroit"} ${state || "MI"}`);
  return `https://www.tiktok.com/search?q=${q}`;
}

function buildYelpSearch(name: string, city?: string | null, state?: string | null) {
  const qn = encodeURIComponent(name);
  const loc = encodeURIComponent(`${city || "Detroit"}, ${state || "MI"}`);
  return `https://www.yelp.com/search?find_desc=${qn}&find_loc=${loc}`;
}

function buildDirections(place: Place, userLoc?: { lat: number; lng: number } | null) {
  const dest = place.lat && place.lng
    ? `${place.lat},${place.lng}`
    : encodeURIComponent(place.address || place.name);
  const origin = userLoc?.lat && userLoc?.lng ? `&origin=${userLoc.lat},${userLoc.lng}` : "";
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}${origin}`;
}

function prettyCloseTime(closes_at: string | null) {
  if (!closes_at) return null;
  const [h, m] = closes_at.split(":").map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function PlaceCardRow({ place, userLoc }: Props) {
  const [showVideos, setShowVideos] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const openNow = useMemo(
    () => isOpenNow(place.opens_at, place.closes_at, { id: String(place.id), timeZone: "America/Detroit" }),
    [place.opens_at, place.closes_at, place.id]
  );

  const distanceMiles = useMemo(() => {
    if (!userLoc || !place.lat || !place.lng) return null;
    return Math.round(haversineMiles(userLoc, { lat: place.lat, lng: place.lng }) * 10) / 10;
  }, [userLoc, place.lat, place.lng]);

  const img = place.imageUrl || "/media/placeholder.jpg";
  const tiktokSearch = place.links.tiktokSearch || buildTikTokSearch(place.name, place.city, place.state);
  const yelp = place.links.yelp || buildYelpSearch(place.name, place.city, place.state);
  const maps = buildDirections(place, userLoc);
  const site = place.links.website;
  const closeTxt = prettyCloseTime(place.closes_at);

  const placeId = slugify(place.name);
  const videoList = embeddedVideos[placeId] || [];

  useEffect(() => {
    if (showVideos && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showVideos]);

  return (
    <div ref={cardRef} className="card flex flex-col gap-3 p-3">
      <div className="flex gap-3">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-neutral-800">
          <img src={img} alt={place.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-3">
            <h3 className="truncate text-base font-semibold">{place.name}</h3>
            <span className={`pill ${openNow ? "border-green-600 text-green-300 bg-green-500/10" : "border-red-600 text-red-300 bg-red-500/10"}`}>
              <Clock size={14} />
              {openNow ? (closeTxt ? `Open • closes ${closeTxt}` : "Open now") : "Closed"}
            </span>
          </div>
          <div className="mt-1 text-sm text-neutral-400">
            {place.address || "—"}{distanceMiles !== null ? ` • ${distanceMiles} mi` : ""}
          </div>

          <div className="mt-2 flex flex-wrap gap-2 w-full">
            <a className="pill border-blue-600 bg-blue-500/10 text-blue-300" href={maps} target="_blank" rel="noreferrer">
              <MapPin size={14} /> Directions
            </a>
            <a className="pill border-pink-600 bg-pink-500/10 text-pink-300" href={yelp} target="_blank" rel="noreferrer">
              <ExternalLink size={14} /> Yelp
            </a>
            <a className="pill border-purple-600 bg-purple-500/10 text-purple-300" href={tiktokSearch} target="_blank" rel="noreferrer">
              <ExternalLink size={14} /> TikTok
            </a>
            {videoList.length > 0 ? (
              <button
                className="pill border-green-600 bg-green-500/10 text-green-300"
                onClick={() => setShowVideos(!showVideos)}
              >
                <ExternalLink size={14} /> Videos ({videoList.length})
              </button>
            ) : (
              <span className="text-xs text-neutral-500">No videos</span>
            )}
            {site && (
              <a className="pill border-zinc-600 bg-zinc-500/10 text-zinc-300" href={site} target="_blank" rel="noreferrer">
                <ExternalLink size={14} /> Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Video Feed */}
      {showVideos && videoList.length > 0 && (
        <div className="relative mt-4">
          {/* Sticky Top Bar with Venue Name + Close Button */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-2 bg-neutral-900/90 backdrop-blur rounded-t-xl">
            <div className="text-sm font-semibold text-white truncate">
              📍 {place.name}
            </div>
            <button
              className="rounded-full bg-white/10 p-1 text-white hover:bg-white/20"
              onClick={() => setShowVideos(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="h-[630.95px] overflow-y-auto snap-y snap-mandatory pb-6 scrollbar-hide">
            {videoList.map((url, i) => (
              <div key={i} className="snap-start flex justify-center py-2">
                <div
                  className="relative w-full max-w-[360px] overflow-hidden rounded-xl border border-green-600"
                  style={{ height: "466.9px" }}
                >
                  <iframe
                    src={url}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    className="absolute top-0 left-0 w-full"
                    style={{
                      height: "630.95px",
                      marginTop: "1px",
                      border: "none",
                      pointerEvents: "auto",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
