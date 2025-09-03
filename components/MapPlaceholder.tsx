export default function MapPlaceholder({ count = 5 }: { count?: number }) {
  return (
    <div className="h-[420px] rounded-xl border border-gray-800 overflow-hidden bg-black">
      <svg viewBox="0 0 800 450" className="w-full h-full">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="800" height="450" fill="url(#g)" />
        {/* simple roads */}
        <path d="M 0 80 L 800 120 M 100 0 L 150 450 M 0 300 L 800 360" stroke="#374151" strokeWidth="4" opacity="0.6"/>
        {/* pins */}
        {Array.from({ length: count }).map((_, i) => {
          const x = 80 + (i * 140) % 700;
          const y = 120 + (i * 60) % 260;
          return (
            <g key={i} transform={`translate(${x}, ${y})`}>
              <circle cx="0" cy="0" r="10" fill="#34d399" />
              <rect x="-2" y="10" width="4" height="10" fill="#34d399" />
            </g>
          );
        })}
      </svg>
      <div className="p-3 text-center text-xs text-gray-400">Map prototype — pins are illustrative only</div>
    </div>
  );
}
