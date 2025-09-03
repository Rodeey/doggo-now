// lib/types.ts

export type LinkSet = {
  google?: string | null;
  yelp?: string | null;
  tiktokSearch?: string | null;
  website?: string | null;
};

export type HoursRange = {
  open: string;   // "08:00"
  close: string;  // "22:00"
};

export type WeeklyHours = {
  // 0 = Sunday ... 6 = Saturday
  [weekday: number]: HoursRange[] | null; // null if closed
};

export type Place = {
  id: string;
  name: string;

  // Address
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;

  // Coordinates (primary)
  latitude: number;
  longitude: number;

  // Coordinates (legacy fields some components use)
  lat?: number | null;
  lng?: number | null;

  // Categorization
  category?: string | null;           // e.g., "Cafe", "Bar", "Park"
  subcategories?: string[];
  dogFriendly?: "yes" | "likely" | "unknown" | "no";

  // Media / description
  imageUrl?: string | null;
  description?: string | null;

  // External links
  links?: LinkSet;

  // Hours (support both simple + detailed shapes)
  opens_at?: string | null;           // e.g., "08:00"
  closes_at?: string | null;          // e.g., "22:00"
  hours?: WeeklyHours;
  openNow?: boolean;

  // Optional scoring/metadata
  confidenceScore?: number;           // 0..1
  updatedAt?: string;                 // ISO timestamp
};
