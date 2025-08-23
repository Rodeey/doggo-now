import { Place } from '../lib/openNow';

export default function PlaceCard({p, detail}:{p:Place, detail?:string}){
  return (
    <div className="card">
      <img src={p.image_url || 'https://source.unsplash.com/featured/?detroit'} alt={p.name} className="card-img"/>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold">{p.name}</div>
            <div className="text-sm text-mute">{p.category} • {p.address}</div>
          </div>
          <span className="badge">Open now</span>
        </div>
        {detail ? <div className="text-sm text-mute mt-2">{detail}</div> : null}
      </div>
    </div>
  );
}
