import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import CategoryChips from '../components/CategoryChips';
import PlaceCard from '../components/PlaceCard';
import data from '../public/data/places.json';
import { isOpenNow, Place } from '../lib/openNow';

type View = 'cards'|'map'|'list';

export default function Home(){
  const [view, setView] = useState<View>('cards');
  const [cat, setCat] = useState<string>('All');
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(()=>{
    setPlaces(data as unknown as Place[]);
  },[]);

  const openNow = useMemo(()=>{
    const open = places.filter(p => isOpenNow(p).open);
    return cat==='All'? open : open.filter(p => (p.category||'').toLowerCase().includes(cat.toLowerCase()));
  }, [places, cat]);

  const stateLine = `Category=${cat} • ViewMode=${view} • Results=${openNow.length}`;

  return (
    <div>
      <Header view={view} onChangeView={setView} />
      <CategoryChips value={cat} onChange={setCat} />
      <div className="container state">{stateLine}</div>

      <div className="container my-3">
        {openNow.length === 0 ? (
          <div className="fallback">
            <div className="text-lg">🐶 Nothing’s open right now.</div>
            <div>Come back later to discover dog‑friendly spots!</div>
          </div>
        ) : view === 'list' ? (
          <div className="list">
            {openNow.map(p => (
              <div className="list-item" key={p.id}>
                <div className="flex items-center gap-3">
                  <img src={p.image_url || 'https://source.unsplash.com/featured/?detroit'} className="w-24 h-24 object-cover rounded-lg" alt={p.name} />
                  <div className="flex-1">
                    <div className="font-bold">{p.name}</div>
                    <div className="text-sm text-mute">{p.category} • {p.address}</div>
                  </div>
                  <span className="badge">Open now</span>
                </div>
              </div>
            ))}
          </div>
        ) : view === 'map' ? (
          <div className="fallback">
            <div className="text-lg">🗺️ Map view coming in the next step.</div>
            <div>We’ll add markers and distance soon.</div>
          </div>
        ) : (
          <div className="grid">
            {openNow.map(p => <PlaceCard key={p.id} p={p} detail={p.address} />)}
          </div>
        )}
      </div>
    </div>
  );
}
