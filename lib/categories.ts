// lib/categories.ts
export type CoreCat = "Restaurant" | "Bar" | "Cafe";

// Normalize any raw category text into one of our core categories
export function normalizeCategory(raw?: string | null): CoreCat {
  const s = (raw || "").toLowerCase();
  if (/(cafe|coffee|tea|espresso|roast|bakery|bagel|donut)/i.test(s)) return "Cafe";
  if (/(bar|brew|tap|pub|distill|cocktail|speakeasy|tavern|club)/i.test(s)) return "Bar";
  return "Restaurant";
}

// Tailwind theme tokens shared by chips and pills
export const CATEGORY_THEME: Record<
  CoreCat,
  {
    chip: { base: string; active: string; countBase: string; countActive: string };
    pill: { base: string; border: string; text: string };
  }
> = {
  Restaurant: {
    chip: {
      base: "border-amber-700 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25",
      active: "bg-amber-500 text-black border-amber-500",
      countBase: "bg-amber-500/20 text-amber-200",
      countActive: "bg-black/10 text-black",
    },
    pill: {
      base: "bg-amber-500/15",
      border: "border-amber-600/50",
      text: "text-amber-300",
    },
  },
  Bar: {
    chip: {
      base: "border-rose-700 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25",
      active: "bg-rose-500 text-white border-rose-500",
      countBase: "bg-rose-500/20 text-rose-200",
      countActive: "bg-white/20 text-white",
    },
    pill: {
      base: "bg-rose-500/15",
      border: "border-rose-600/50",
      text: "text-rose-300",
    },
  },
  Cafe: {
    chip: {
      base: "border-teal-700 bg-teal-500/15 text-teal-200 hover:bg-teal-500/25",
      active: "bg-teal-500 text-black border-teal-500",
      countBase: "bg-teal-500/20 text-teal-200",
      countActive: "bg-black/10 text-black",
    },
    pill: {
      base: "bg-teal-500/15",
      border: "border-teal-600/50",
      text: "text-teal-300",
    },
  },
};
