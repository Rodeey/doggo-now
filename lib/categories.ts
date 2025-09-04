import type { CoreCat } from "./types";

type PillTheme = { base: string; border: string; text: string };
type Theme = { pill: PillTheme; mapHex: string };

export const CATEGORY_THEME: Record<CoreCat, Theme> = {
  Restaurant: { pill: { base: "bg-amber-500/10", border: "border-amber-600", text: "text-amber-300" }, mapHex: "#f59e0b" },
  Bar:        { pill: { base: "bg-rose-500/10",  border: "border-rose-600",  text: "text-rose-300"  }, mapHex: "#f43f5e" },
  Cafe:       { pill: { base: "bg-teal-500/10",  border: "border-teal-600",  text: "text-teal-300"  }, mapHex: "#14b8a6" },
  Store:      { pill: { base: "bg-zinc-500/10",  border: "border-zinc-600",  text: "text-zinc-300"  }, mapHex: "#a1a1aa" },
  Park:       { pill: { base: "bg-green-500/10", border: "border-green-600", text: "text-green-300" }, mapHex: "#22c55e" },
  Bakery:     { pill: { base: "bg-pink-500/10",  border: "border-pink-600",  text: "text-pink-300"  }, mapHex: "#ec4899" },
  Brewery:    { pill: { base: "bg-indigo-500/10",border: "border-indigo-600",text: "text-indigo-300"}, mapHex: "#6366f1" },
};
