"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer as LeafletMap, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix for missing marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  state?: string;
  google_url?: string;
  yelp_url?: string;
  website?: string;
};

type Props = {
  places: Place[];
  userLoc?: { lat: number; lng: number } | null;
};

export default function MapView({ places, userLoc }: Props) {
  const center: [number, number] =
    userLoc?.lat && userLoc?.lng
      ? [userLoc.lat, userLoc.lng]
      : places.length
      ? [places[0].lat, places[0].lng]
      : [42.3314, -83.0458]; // Detroit fallback

  return (
    <div className="h-[70vh] w-full overflow-hidden rounded-2xl border border-neutral-800">
      <LeafletMap
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {places.map((place) => (
          <Marker key={place.id} position={[place.lat, place.lng]}>
            <Popup>
              <div className="text-sm">
                <strong>{place.name}</strong>
                <div>{place.address}</div>
                <div>
                  {place.city}, {place.state}
                </div>
                <div className="flex flex-col mt-2 space-y-1">
                  {place.google_url && (
                    <a
                      href={place.google_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      Google
                    </a>
                  )}
                  {place.yelp_url && (
                    <a
                      href={place.yelp_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-500 underline"
                    >
                      Yelp
                    </a>
                  )}
                  {place.website && (
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-500 underline"
                    >
                      Website
                    </a>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </LeafletMap>
    </div>
  );
}
