export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="text-lg font-semibold tracking-tight">
          <span className="text-brand-400">Doggo</span> <span className="text-neutral-200">Now</span>
        </div>
        <div className="text-xs text-neutral-400">Detroit • Open Now</div>
      </div>
    </header>
  );
}
