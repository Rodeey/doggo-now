// components/MapView.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { CoreCat } from "../lib/categories";
import { CATEGORY_THEME } from "../lib/categories";
import type { Map as LeafletMap } from "leaflet";

// Dynamically import react-leaflet pieces (SSR off)
const MapContainer = dynamic(
  async () => (await import("react-leaflet")).MapContainer,
  { ssr: false }
);
const TileLayer = dynamic(
  async () => (await import("react-leaflet")).TileLayer,
  { ssr: false }
);
const CircleMarker = dynamic(
  async () => (await import("react-leaflet")).CircleMarker,
  { ssr: false }
);
const Popup = dynamic(async () => (await import("react-leaflet")).Popup, {
  ssr: false,
});
const Marker = dynamic(async () => (await import("react-leaflet")).Marker, {
  ssr: false,
});

type Place = {
  id?: string | number;
  name: string;
  category?: CoreCat | string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  googleMapsUrl?: string | null;
  yelpUrl?: string | null;
  website?: string | null;
};

type Props = {
  places: Place[];
  userLoc: { lat: number; lng: number };
};

// Map colors per category
const CAT_COLOR: Record<CoreCat, string> = {
  Restaurant: "#f59e0b", // amber-500
  Bar: "#f43f5e",        // rose-500
  Cafe: "#14b8a6",       // teal-500
};

/** TikTok search helper (falls back to Detroit, MI) */
function toTikTok(name: string, address?: string | null) {
  const parts = (address || "").split(",").map((s) => s.trim());
  const city = parts.length >= 2 ? parts[parts.length - 2] : "Detroit";
  const state = (parts[parts.length - 1] || "").match(/\b[A-Z]{2}\b/)?.[0] || "MI";
  const q = encodeURIComponent(`${name} ${city} ${state}`);
  return `https://www.tiktok.com/search?q=${q}`;
}

export default function MapView({ places, userLoc }: Props) {
  const mapRef = useRef<LeafletMap | null>(null);

  // Client-only Leaflet + DivIcons
  const [Lmod, setLmod] = useState<any>(null);
  const [icons, setIcons] = useState<Partial<Record<CoreCat, any>>>({});

  // Load Leaflet + build category DivIcons
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled) return;

      const makeDivIcon = (hex: string, svg: string) =>
        new L.DivIcon({
          className: "",
          html: `
            <div style="
              width:28px;height:28px;border-radius:50%;
              background:${hex};display:flex;align-items:center;justify-content:center;
              box-shadow:0 2px 6px rgba(0,0,0,0.35); border:2px solid rgba(0,0,0,0.25);
            ">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                   width="16" height="16" fill="white" aria-hidden="true">
                ${svg}
              </svg>
            </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -16],
        });

      const svgRestaurant =
        `<path d="M7 2a1 1 0 0 0-1 1v7a2 2 0 1 0 4 0V8h1v9a2 2 0 1 0 4 0V2h-2v6h-1V3a1 1 0 1 0-2 0v5h-1V3a1 1 0 0 0-1-1z"/>`;
      const svgBar =
        `<path d="M5 3h14v2l-5 6v6h2v2H8v-2h2v-6L5 5V3zm4 2 3 4 3-4H9z"/>`;
      const svgCafe =
        `<path d="M17 8h2a3 3 0 1 1 0 6h-1a5 5 0 0 1-5 4H9a5 5 0 0 1-5-5V8h13zm1 2v4h1a2 2 0 0 0 0-4h-1z"/>`;

      setIcons({
        Restaurant: makeDivIcon(CAT_COLOR.Restaurant, svgRestaurant),
        Bar: makeDivIcon(CAT_COLOR.Bar, svgBar),
        Cafe: makeDivIcon(CAT_COLOR.Cafe, svgCafe),
      });
      setLmod(L);
    })();
    return () => { cancelled = true; };
  }, []);

  // Build bounds (all place points + user location)
  const boundsPoints = useMemo<[number, number][]>(() => {
    const pts: [number, number][] = [];
    for (const p of places) {
      if (typeof p.lat === "number" && typeof p.lng === "number") {
        pts.push([p.lat, p.lng]);
      }
    }
    pts.push([userLoc.lat, userLoc.lng]);
    return pts;
  }, [places, userLoc.lat, userLoc.lng]);

  // Fit the map to markers whenever data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || boundsPoints.length === 0) return;

    if (boundsPoints.length === 1) {
      map.setView(boundsPoints[0], 14);
    } else {
      (map as any).fitBounds(boundsPoints as any, { padding: [40, 40] });
    }
  }, [boundsPoints]);

  const center: [number, number] = [userLoc.lat, userLoc.lng];

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        style={{ height: 420, width: "100%" }}
        className="bg-zinc-900"
        ref={mapRef as any}
      >
        {/* OSM tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* You are here (blue dot) */}
        <CircleMarker
          center={[userLoc.lat, userLoc.lng]}
          radius={6}
          pathOptions={{
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.9,
            weight: 2,
          }}
        >
          <Popup>You are here</Popup>
        </CircleMarker>

        {/* Place markers */}
        {places
          .filter((p) => typeof p.lat === "number" && typeof p.lng === "number")
          .map((p) => {
            const cat = (p.category as CoreCat) || "Restaurant";
            const color = CAT_COLOR[cat];
            const icon = icons[cat];

            return icon && Lmod ? (
              <Marker
                key={String(p.id ?? p.name)}
                position={[p.lat as number, p.lng as number]}
                icon={icon}
              >
                <Popup>
                  <div className="min-w-[220px]">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-semibold">{p.name}</span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] ${
                          CATEGORY_THEME[cat].pill.base
                        } ${CATEGORY_THEME[cat].pill.border} ${
                          CATEGORY_THEME[cat].pill.text
                        }`}
                      >
                        {cat}
                      </span>
                    </div>
                    {p.address && (
                      <div className="mb-2 text-xs text-zinc-600">{p.address}</div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {/* Directions */}
                      <a
                        href={
                          p.googleMapsUrl ||
                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${p.name} ${p.address ?? ""}`.trim()
                          )}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-100"
                      >
                        Directions
                      </a>

                      {/* Yelp */}
                      <a
                        href={
                          p.yelpUrl ||
                          `https://www.yelp.com/search?find_desc=${encodeURIComponent(
                            p.name
                          )}&find_loc=Detroit%2C%20MI`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#d32323] px-3 py-1 text-xs font-medium text-white hover:bg-[#a51c1c]"
                        title="Open on Yelp"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="h-3.5 w-3.5 fill-current"
                          aria-hidden="true"
                        >
                          <path d="M21.77 16.67c-.11-.26-.37-.44-.66-.44l-4.97-.37c-.3 0-.57.17-.68.44l-1.96 4.72c-.11.26-.06.56.13.77.19.21.47.3.74.25l4.97-1c.29-.06.51-.28.58-.56l1.66-5.07c.05-.19.05-.4-.08-.54ZM14.6 12.86c.27.08.56-.02.73-.25l2.89-4.18c.16-.23.18-.54.05-.79s-.37-.41-.64-.41l-5.54.25c-.29.01-.55.2-.65.47l-2.04 5.34c-.1.27-.03.58.19.78.22.2.53.26.8.16l4.21-1.37ZM9.5 10.77c.23-.18.33-.47.27-.75L8.37 4.9c-.05-.28-.25-.5-.52-.59-.27-.09-.57-.02-.77.18L3.51 8.18c.2.2.26.5.16.76.1.26.34.45.61.49l5.54.78c.27.04.54-.05.72-.24ZM9.22 13.32l-5.4 1.67c-.27.09-.47.31-.51.6-.05.28.07.56.3.72l4.42 3.15c.23.16.54.19.8.07.26-.12.44-.36.46-.64l.28-4.82c.02-.29-.13-.57-.35-.75ZM20.03 3.44c-.2-.2-.5-.27-.77-.18L13.74 5c-.27.09-.47.31-.51.6-.05.28.07.56.3.72l3.94 2.81c.23.16.54.19.8.07.26-.12.44-.36.46-.64l.28-4.82c.02-.28-.09-.57-.29-.77Z" />
                        </svg>
                        Yelp
                      </a>

                      {/* TikTok */}
                      <a
                        href={toTikTok(p.name, p.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-black px-3 py-1 text-xs font-medium text-white hover:bg-zinc-900"
                        title="Search on TikTok"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 48 48"
                          className="h-3.5 w-3.5 fill-current"
                          aria-hidden="true"
                        >
                          <path d="M31.5 10.2c1.8 2 4.2 3.4 7 3.7v6.1c-2.6-.1-5-1-7-2.4v10.1c0 6.2-5 11.2-11.2 11.2S9 33.9 9 27.7c0-6.2 5-11.2 11.2-11.2 1 0 2 .1 2.9.4v6.3a5.1 5.1 0 0 0-2.9-.9 5 5 0 1 0 5 5V6h6.3v4.2Z"/>
                        </svg>
                        TikTok
                      </a>

                      {/* Website */}
                      {p.website && (
                        <a
                          href={p.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-500"
                        >
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ) : (
              // Fallback: colored dot until icons are ready
              <CircleMarker
                key={String(p.id ?? p.name)}
                center={[p.lat as number, p.lng as number]}
                radius={10}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.25, weight: 2 }}
              >
                <Popup>
                  <div className="min-w-[220px]">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-semibold">{p.name}</span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] ${
                          CATEGORY_THEME[cat].pill.base
                        } ${CATEGORY_THEME[cat].pill.border} ${
                          CATEGORY_THEME[cat].pill.text
                        }`}
                      >
                        {cat}
                      </span>
                    </div>
                    {p.address && (
                      <div className="mb-2 text-xs text-zinc-600">{p.address}</div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
      </MapContainer>
    </div>
  );
}
