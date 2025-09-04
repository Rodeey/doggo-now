import React from "react";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { Place } from "@/lib/types";

// Dynamic imports (no SSR) — unchanged
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then(m => m.CircleMarker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });

// TYPE-ONLY WORKAROUND:
// Some CI setups mis-detect MapContainer's props. Cast to a broad component type to satisfy TS at build time.
// This does NOT change runtime behavior.
const AnyMapContainer = MapContainer as unknown as React.ComponentType<any>;

type Props = {
  places: Place[];
  userLoc?: { lat: number; lng: number } | null;
};

export default function MapView({ places, userLoc }: Props) {
  const center = (userLoc && userLoc.lat && userLoc.lng
    ? [userLoc.lat, userLoc.lng]
    : [42.3314, -83.0458]) as [number, number];

  const markers = useMemo(() => {
    return places.filter(p => p.lat && p.lng);
  }, [places]);

  return (
    <div className="h-[70vh] w-full overflow-hidden rounded-2xl border border-neutral-800">
      <AnyMapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {markers.map(p => (
          <CircleMarker
            key={p.id}
            center={[p.lat as number, p.lng as number]}
            radius={8}
            pathOptions={{ color: "#3b82f6", fillOpacity: 0.7 }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <div className="font-semibold">{p.name}</div>
                {p.address && (
                  <div className="mt-1 text-xs text-neutral-500">{p.address}</div>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    className="pill border-blue-600 bg-blue-500/10 text-blue-300"
                    href={
                      p.links.google ||
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name)}`
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Directions
                  </a>
                  <a
                    className="pill border-pink-600 bg-pink-500/10 text-pink-300"
                    href={
                      p.links.yelp ||
                      `https://www.yelp.com/search?find_desc=${encodeURIComponent(
                        p.name
                      )}&find_loc=${encodeURIComponent(p.city || "Detroit")}%2C%20${encodeURIComponent(
                        p.state || "MI"
                      )}`
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Yelp
                  </a>
                  <a
                    className="pill border-purple-600 bg-purple-500/10 text-purple-300"
                    href={
                      p.links.tiktokSearch ||
                      `https://www.tiktok.com/search?q=${encodeURIComponent(
                        p.name +
                          " " +
                          (p.city || "Detroit") +
                          " " +
                          (p.state || "MI")
                      )}`
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    TikTok
                  </a>
                  {p.links.website && (
                    <a
                      className="pill border-zinc-600 bg-zinc-500/10 text-zinc-300"
                      href={p.links.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Website
                    </a>
                  )}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </AnyMapContainer>
    </div>
  );
}
