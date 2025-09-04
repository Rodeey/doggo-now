type Options = { timeZone?: string };

function parseHM(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

function getDetroitNowMinutes(tz: string): number {
  const nowStr = new Date().toLocaleString("en-US", { timeZone: tz });
  const now = new Date(nowStr);
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Detroit-local "open now" with overnight support.
 * If closes_at < opens_at, it's an overnight window (e.g., 18:00 -> 02:00).
 */
export function isOpenNow(opens_at: string | null, closes_at: string | null, opts: Options = {}): boolean {
  const tz = opts.timeZone || "America/Detroit";
  if (!opens_at || !closes_at) return false;

  const openMins = parseHM(opens_at);
  const closeMins = parseHM(closes_at);
  const nowMins = getDetroitNowMinutes(tz);

  if (openMins === closeMins) {
    // Treat as closed if same time (avoid accidental 24h).
    return false;
  }

  if (closeMins > openMins) {
    // Same-day window
    return nowMins >= openMins && nowMins < closeMins;
  } else {
    // Overnight window, e.g. 18:00 -> 02:00
    return nowMins >= openMins || nowMins < closeMins;
  }
}
