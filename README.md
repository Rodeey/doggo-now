# Doggo Now (Clean Reset)

A minimal Next.js + TypeScript + Tailwind app for **real-time dog-friendly discovery** in Detroit.

## North Star
- Show venues that are **open now** (Detroit local, handles overnights like 20:00→02:00)
- Two views sharing the same filtered set: **List** and **Map**
- Category filter via chips (no dropdown)
- Actions per venue: **Directions**, **Yelp**, **TikTok search**, **Website**
- Location prompt with **geolocate** + **Detroit fallback**

## Run locally
```bash
npm install
npm run dev
# open http://localhost:3000
```

### Dependencies of note
- `react-leaflet` + `leaflet` for the Map (pins as CircleMarker to avoid marker icon path issues in SSR)
- `tailwindcss` for styling
- `lucide-react` for icons

## File map (single-source-of-truth)
- **/pages/index.tsx** — page controller (filters in order: open → search → category)
- **/components/CategoryChips.tsx** — shows counts from already-filtered list; emits selection
- **/components/PlaceCardRow.tsx** — single row UI + actions
- **/components/MapView.tsx** — pins + popups; **expects already filtered** list
- **/lib/isOpenNow.ts** — hour math (Detroit timezone + overnights)
- **/lib/categories.ts** — category → pill colors + map hex
- **/lib/types.ts** — shared types
- **/data/places.json** — seed data (Detroit-local hours)
- **/styles/globals.css** — Tailwind base & global styles

## Audit checklist
- Chips count equals **rows** and **map pins**
- Toggling chips only restricts category within **already open** set
- The same venues appear in **list** and **map**
- Actions open correct URLs (Maps/Yelp/TikTok/Website)
- Overnight windows behave correctly across **midnight in Detroit**

## Notes
- Images use `object-cover` inside a fixed 24x24 box to avoid distortion.
- Category chips **hide zero-count** categories automatically.
