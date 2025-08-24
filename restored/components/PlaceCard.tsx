type PlaceCardProps = {
  title: string;
  category?: string | null;
  imageUrl?: string | null;
  tags?: string[];
};

export default function PlaceCard({ title, category, imageUrl, tags = [] }: PlaceCardProps) {
  return (
    <article className="group rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-[16/9] overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gray-100" />
        )}
        {category && (
          <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs text-white">
            {category}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold leading-tight">{title}</h3>
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
