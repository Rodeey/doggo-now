'use client';

type View = 'cards' | 'map' | 'list';

type Props = {
  view: View;
  onChangeView: (v: View) => void;
};

function label(v: View) {
  return v.charAt(0).toUpperCase() + v.slice(1);
}

export default function Header({ view, onChangeView }: Props) {
  const views: View[] = ['cards', 'map', 'list'];

  return (
    <div className="header">
      <div className="container flex items-center justify-between">
        <div className="brand">DOGGO NOW 🐾</div>
        <div className="toolbar">
          <div className="flex gap-1 rounded-xl border border-white/15 overflow-hidden">
            {views.map((v) => (
              <button
                key={v}
                onClick={() => onChangeView(v)}
                className={`px-3 py-1.5 text-sm ${view === v ? 'bg-accent text-ink' : 'bg-pane'}`}
              >
                {label(v)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
