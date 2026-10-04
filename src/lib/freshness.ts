/** Lessons are flagged when their last review is more than this many months old. */
export const REVIEW_MAX_MONTHS = 12;

export function isReviewStale(lastReviewed: Date, now: Date = new Date()): boolean {
  const limit = new Date(lastReviewed);
  limit.setUTCMonth(limit.getUTCMonth() + REVIEW_MAX_MONTHS);
  return now.getTime() > limit.getTime();
}
