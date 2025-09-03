// components/ListView.tsx
import { Place } from "@/lib/types";
import { isOpenNow } from "@/lib/isOpenNow";
import { MapPin, ExternalLink } from "lucide-react";

type Props = {
  places?: Place[];
  location: { lat: number; lng: number };
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // miles to one decimal place
  return (R * c * 0.621371).toFixed(1);
}

export default function ListView({ places = [], location }: Props) {
  if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
    return <div className="text-white">Loading nearby places...</div>;
  }

  return (
    <div className="space-y-4">
      {places.map((place, index) => {
        // Support both shapes: (lat,lng) and (latitude,longitude)
        const lat = (place.lat ?? place.latitude ?? 42.3314);
        const lng = (place.lng ?? place.longitude ?? -83.0458);

        const distance = calculateDistance(location.lat, location.lng, lat, lng);

        // Safely determine open/closed only when times exist
        const openNow = isOpenNow(place.opens_at, place.closes_at);

        // Support both shapes for media/links:
        //   image_url OR imageUrl
        //   google_url/yelp_url OR links.google/links.yelp
        const legacy = place as unknown as {
          image_url?: string | null;
          google_url?: string | null;
          yelp_url?: string | null;
        };

        const imageSrc = legacy.image_url ?? place.imageUrl ?? "/placeholder.png";
        const googleUrl = legacy.google_url ?? place.links?.google ?? undefined;
        const yelpUrl = legacy.yelp_url ?? place.links?.yelp ?? undefined;

        return (
          <div
            key={index}
            className="bg-white rounded-xl p-4 shadow-md flex justify-between items-center"
          >
            <div className="flex items-center space-x-4">
              <img
                src={imageSrc || "/placeholder.png"}
                alt={place.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="font-bold text-black">{place.name}</div>
                <div className="text-sm text-gray-500">
                  {place.category || "Venue"}{place.address ? ` • ${place.address}` : ""}
                </div>
                <div className="text-xs text-gray-500">{distance} miles away</div>
                {openNow && (
                  <div className="text-green-600 font-medium text-xs">Open Now</div>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              {googleUrl && (
                <a
                  href={googleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-500"
                  aria-label="Open in Google"
                >
                  <MapPin />
                </a>
              )}
              {yelpUrl && (
                <a
                  href={yelpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black"
                  aria-label="Open in Yelp"
                >
                  <ExternalLink />
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
