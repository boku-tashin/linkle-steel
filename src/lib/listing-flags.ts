// src/lib/listing-flags.ts
import type { Listing } from "@/lib/mock-listings";

/** 期日が近い or 残枠わずか */
export function isClosingSoon(l: Listing, hours = 72, lowLeft = 2) {
  const left = l.capacityLeft ?? 0;
  const t = new Date(l.date).getTime();
  const now = Date.now();
  const withinHours = t - now <= hours * 60 * 60 * 1000 && t >= now;
  const lowCapacity = left > 0 && left <= lowLeft;
  return withinHours || lowCapacity;
}

/** 期日経過 or 満員 */
export function isClosed(l: Listing) {
  const left = l.capacityLeft ?? 0;
  const t = new Date(l.date).getTime();
  return left <= 0 || t < Date.now();
}