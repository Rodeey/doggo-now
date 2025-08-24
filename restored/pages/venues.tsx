import PlaceCard from "../components/PlaceCard";

type Media = { hero_image_url?: string; gallery_urls?: string[]; media_last_updated?: string };
type DB = Record<string, Media>;
type Card = { slug: string; title: string; imageUrl: string | null; category: string | null; tags: string[] };

export async function getStaticProps() {
  const mod: any = await import("../data/venues_media.json");
  const db: DB = (mod.default || mod) as DB;

  const cards: Card[] = Object.entries(db).map(([slug, m]) => ({
    slug,
    title: slug.replace(/_/g, " "),
    imageUrl: m.hero_image_url ?? (m.gallery_urls?.[0] ?? null),
    category: null,   // ✅ never undefined
    tags: [],         // ✅ always an array
  }));

  return { props: { cards } };
}

export default function VenuesIndex({ cards }: { cards: Card[] }) {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Venues</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <a key={c.slug} href={`/venues/${c.slug}`} className="contents">
            <PlaceCard title={c.title} imageUrl={c.imageUrl} category={c.category} tags={c.tags} />
          </a>
        ))}
      </div>
    </main>
  );
}
