// components/CategoryChips.tsx
import type { CoreCat } from "../lib/categories";
import { CATEGORY_THEME } from "../lib/categories";

type Cat = { name: CoreCat; count: number };
type Props = {
  value: string;
  onChange: (v: string) => void;
  categories: Cat[];
};

export default function CategoryChips({ value, onChange, categories }: Props) {
  const total = categories.reduce((a, c) => a + c.count, 0);
  const chips = [{ name: "All", count: total }, ...categories];

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-2">
        {chips.map((c) => {
          const active = value === c.name;
          if (c.name === "All") {
            return (
              <button
                key="All"
                onClick={() => onChange("All")}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                  active
                    ? "border-white bg-white text-black"
                    : "border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                <span>All</span>
                <span className={`${active ? "bg-black/10 text-black" : "bg-zinc-800 text-zinc-300"} rounded-full px-1.5 text-xs`}>
                  {c.count}
                </span>
              </button>
            );
          }
          const theme = CATEGORY_THEME[c.name as CoreCat];
          return (
            <button
              key={c.name}
              onClick={() => onChange(c.name)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                active ? theme.chip.active : theme.chip.base
              }`}
            >
              <span>{c.name}</span>
              <span
                className={`rounded-full px-1.5 text-xs ${
                  active ? theme.chip.countActive : theme.chip.countBase
                }`}
              >
                {c.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
