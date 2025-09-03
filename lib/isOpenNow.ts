// lib/isOpenNow.ts

/**
 * Returns true if the current time falls between open/close strings ("HH:mm").
 * Safely handles missing values and overnight hours (e.g., 22:00–02:00).
 */
export function isOpenNow(open?: string | null, close?: string | null): boolean {
  if (!open || !close) return false;

  const [oh, om = "0"] = open.split(":");
  const [ch, cm = "0"] = close.split(":");

  const startMinutes = Number(oh) * 60 + Number(om);
  const endMinutes = Number(ch) * 60 + Number(cm);

  const now = new Date();
  const curMinutes = now.getHours() * 60 + now.getMinutes();

  // Overnight range (e.g., 22:00–02:00)
  if (endMinutes < startMinutes) {
    return curMinutes >= startMinutes || curMinutes < endMinutes;
  }
  // Normal same-day range
  return curMinutes >= startMinutes && curMinutes < endMinutes;
}

