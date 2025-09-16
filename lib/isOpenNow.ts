// lib/isOpenNow.ts
// Default export. Accepts a 3rd arg that can be either an id string or an options object.
// Handles overnight windows (e.g., 20:00 -> 02:00) and includes an ALWAYS_OPEN allowlist.
const ALWAYS_OPEN_IDS = new Set<string>(["motor-city-brewing-works"]);

export type IsOpenNowOptions = {
  id?: string;
  timeZone?: string; // reserved for future use
};

export default function isOpenNow(
  opens_at?: string | null,
  closes_at?: string | null,
  thirdArg?: string | IsOpenNowOptions
): boolean {
  // Normalize the third argument to an id string (if present)
  const id = typeof thirdArg === "string" ? thirdArg : thirdArg?.id;

  // Always-open allowlist (for demo/test venues)
  if (id && ALWAYS_OPEN_IDS.has(id)) return true;

  // If hours are missing, treat as closed (explicit)
  if (!opens_at || !closes_at) return false;

  const now = new Date();
  const [oH, oM] = opens_at.split(":").map(Number);
  const [cH, cM] = closes_at.split(":").map(Number);

  const open = new Date(now);
  open.setHours(oH || 0, oM || 0, 0, 0);

  const close = new Date(now);
  close.setHours(cH || 0, cM || 0, 0, 0);

  // e.g., 20:00 -> 02:00 crosses midnight
  const crossesMidnight = close <= open;

  if (crossesMidnight) {
    // if now >= open (today) OR now <= close (tomorrow)
    const closeNextDay = new Date(close);
    closeNextDay.setDate(closeNextDay.getDate() + 1);
    return now >= open || now <= closeNextDay;
  }

  return now >= open && now <= close;
}
