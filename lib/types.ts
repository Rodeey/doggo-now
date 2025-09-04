export type CoreCat = "Restaurant" | "Bar" | "Cafe" | "Store" | "Park" | "Bakery" | "Brewery";

export type Links = {
  google: string | null;
  yelp: string | null;
  website: string | null;
  tiktokSearch?: string | null;
};

export type Place = {
  id: string; // slug
  name: string;
  address: string | null;
  city?: string | null;
  state?: string | null;
  category: CoreCat | string | null;
  lat: number | null;
  lng: number | null;
  imageUrl: string | null;
  opens_at: string | null; // "HH:MM" Detroit-local
  closes_at: string | null; // "HH:MM"
  links: Links;
  subcategories: string[];
  dogFriendly: "unknown" | "yes" | "no";
};
