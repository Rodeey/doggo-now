# Doggo Now — MVP Patch Pack

This pack removes the old **Cards** view and gives you a clean **List / Map** toggle with safe "open now" logic and a Yelp-style list.

## Files included
- `pages/index.tsx` — main page (List/Map only)
- `components/Header.tsx` — two-button toggle (Map, List)
- `components/CategoryChips.tsx` — simple filter chips (uses your data to populate)
- `components/PlaceRow.tsx` — horizontal list item with image + name + category + open badge + address
- `components/MapPlaceholder.tsx` — inline SVG mock map with pins
- `lib/isOpenNow.ts` — robust open/close logic with per-day or simple hours

## Install
1. Backup your project or make a branch:
   ```bash
   git checkout -b mvp-patch
   ```
2. Copy files into your project (overwrite the existing ones):
   - `pages/index.tsx`
   - `components/Header.tsx`
   - `components/CategoryChips.tsx` (replace yours for now to guarantee compatibility)
   - `components/PlaceRow.tsx` (new)
   - `components/MapPlaceholder.tsx` (new)
   - `lib/isOpenNow.ts` (new)
3. Ensure your data is at `data/places.json` with fields like:
   ```json
   [{"name":"Pizza Palace","category":"Restaurant","image_url":"/media/pizza_palace/hero.jpg","opens_at":"09:00","closes_at":"22:00","address":"123 Main St, Detroit"}]
   ```
   Per-day hours are also supported:
   ```json
   {"open_hours":{"Monday":["09:00","22:00"]}}
   ```
4. Run:
   ```bash
   npm run dev
   ```

You should see only **List** and **Map** in the toggle, with a clean list layout and a static map placeholder.
