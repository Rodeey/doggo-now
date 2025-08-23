export type HoursMap = Record<string, [string,string] | []>;

export type Place = {
  id: number;
  name: string;
  category: 'Bar'|'Restaurant'|'Cafe'|'Park'|'Store'|string;
  address: string;
  phone?: string;
  lat: number;
  lng: number;
  image_url?: string;
  dog_friendly?: boolean;
  always_open?: boolean;
  open_hours?: HoursMap; // keys = 'Monday'...'Sunday'
};

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export function isOpenNow(p: Place, now: Date = new Date()): { open: boolean; closesAt?: string } {
  if (p.always_open) return { open: true, closesAt: '24/7' };
  const oh = p.open_hours || {};
  const today = DAYS[now.getDay()];
  const yesterday = DAYS[(now.getDay()+6)%7];

  const intervals: {o: Date, c: Date}[] = [];

  function add(dayName: string, anchor: 'today'|'yesterday') {
    const val = oh[dayName];
    if (!val || val.length !== 2) return;
    const [open, close] = val as [string,string];
    if (open === 'Closed' || close === 'Closed') return;
    const base = new Date(now);
    if (anchor === 'yesterday') base.setDate(base.getDate()-1);
    const [ohh,omm] = open.split(':').map(Number);
    const [chh,cmm] = close.split(':').map(Number);
    const o = new Date(base); o.setHours(ohh||0, omm||0, 0, 0);
    const c = new Date(base); 
    if (close === '23:59') { c.setHours(23,59,59,999); }
    else { c.setHours(chh||0, cmm||0, 0, 0); }
    // overnight if close < open
    if (c.getTime() <= o.getTime()) c.setDate(c.getDate()+1);
    intervals.push({o,c});
  }

  add(today, 'today');
  add(yesterday, 'yesterday');

  for (const it of intervals) {
    if (now >= it.o && now <= it.c) {
      const hh = String(it.c.getHours()).padStart(2,'0');
      const mm = String(it.c.getMinutes()).padStart(2,'0');
      return { open: true, closesAt: `${hh}:${mm}` };
    }
  }
  return { open: false };
}
