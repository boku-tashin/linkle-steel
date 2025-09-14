import type { Listing } from "@/lib/mock-listings";

/**
 * 募集終了判定
 * - closed: 手動で終了フラグ
 * - date: 開催日が今日より前
 * - capacity: 定員を超えたら終了
 */
export function isListingClosed(listing: Listing): boolean {
  if ((listing as any).closed) return true;

  const today = new Date();
  const eventDate = new Date(listing.date);
  if (eventDate < today) return true;

  if (
    (listing as any).capacity &&
    (listing as any).applicants &&
    (listing as any).applicants.length >= (listing as any).capacity
  ) {
    return true;
  }

  return false;
}