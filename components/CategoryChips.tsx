import { CATEGORY_THEME } from "@/lib/categories";
import type { CoreCat, Place } from "@/lib/types";
import clsx from "classnames";

type Props = {
  places: Place[];
  selected: CoreCat | "All";
  onChange: (cat: CoreCat | "All") => void;
};

function countsByCategory(places: Place[]) {
  const counts = new Map<string, number>();
  places.forEach(p => {
    const cat = p.category || "Unknown";
    counts.set(cat, (counts.get(cat) || 0) + 1);
  });
  return counts;
}

export default function CategoryChips({ places, selected, onChange }: Props) {
  const counts = countsByCategory(places);

  const entries = Array.from(counts.entries())
    .filter(([_, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);

  const categories = (["All"] as (CoreCat | "All")[]).concat(
    entries.map(([c]) => c as CoreCat)
  );

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const theme = CATEGORY_THEME[cat as CoreCat] || { pill: { base: "bg-zinc-500/10", border: "border-zinc-600", text: "text-zinc-300" }, mapHex: "#a1a1aa" };
        const n = cat === "All" ? places.length : (counts.get(cat as string) || 0);
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={clsx(
              "pill",
              theme.pill.base,
              theme.pill.border,
              theme.pill.text,
              selected === cat ? "ring-2 ring-brand-500" : "opacity-90 hover:opacity-100"
            )}
            aria-pressed={selected === cat}
          >
            <span>{cat}</span>
            <span className="opacity-70">• {n}</span>
          </button>
        );
      })}
    </div>
  );
}
