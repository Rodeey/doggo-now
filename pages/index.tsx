// pages/index.tsx
import fs from "fs/promises";
import path from "path";
import Head from "next/head";

type DBEntry = {
  name: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  category?: string | null;
  image_url?: string | null; // legacy
  imageUrl?: string | null;  // future
  google_url?: string | null;
  yelp_url?: string | null;
  opens_at?: string | null;
  closes_at?: string | null;
};
type DB = Record<string, DBEntry>;

type Card = {
  slug: string;
  name: string;
  address?: string | null;
  image?: string | null;
  category?: string | null;
};

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), "data", "venues_media.json");

  let db: DB = {};
  try {
    const raw = await fs.readFile(filePath, "utf8");
    db = JSON.parse(raw) as DB;
  } catch {
    db = {}; // no file yet = empty list
  }

  const cards: Card[] = Object.entries(db).map(([slug, m]) => ({
    slug,
    name: m.name,
    address: m.address ?? null,
    image: m.image_url ?? m.imageUrl ?? null,
    category: m.category ?? null,
  }));

  return { props: { cards } };
}

export default function Home({ cards }: { cards: Card[] }) {
  return (
    <>
      <Head><title>doggo-now</title></Head>
      <main className="mx-auto max-w-6xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Venues</h1>

        {cards.length === 0 ? (
          <div className="text-sm text-zinc-400">
            No venues yet. Add some to{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-800">
              data/venues_media.json
            </code>.
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <li
                key={c.slug}
                className="rounded-xl overflow-hidden border border-zinc-800 bg-white/5"
              >
                {c.image ? (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="h-40 w-full bg-zinc-900" />
                )}
                <div className="p-3">
                  <div className="font-medium">{c.name}</div>
                  {c.address && (
                    <div className="text-xs text-zinc-400">{c.address}</div>
                  )}
                  {c.category && (
                    <div className="mt-2 inline-block rounded-full bg-zinc-800 px-2 py-0.5 text-xs">
                      {c.category}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
