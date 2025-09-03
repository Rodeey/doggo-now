// lib/types.ts

export type Links = {
  google?: string | null;
  yelp?: string | null;
  website?: string | null;
  tiktokSearch?: string | null;
};

export type Place = {
  id?: string | number;
  name: string;

  // primary fields used by the app
  category?: string | null;
  subcategories?: string[];
  address?: string | null;

  // main coordinates used in components
  lat?: number | null;
  lng?: number | null;

  // legacy/compat coordinates (OPTIONAL on purpose)
  latitude?: number;
  longitude?: number;

  imageUrl?: string | null;
  links?: Links;

  opens_at?: string | null;
  closes_at?: string | null;

  dogFriendly?: "yes" | "no" | "patio" | "unknown";
};
