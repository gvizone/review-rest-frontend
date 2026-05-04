import type { Review } from '../models';
import { averageNote } from './review-rating';

function roundToTenth(x: number): number {
  return Math.round(x * 10) / 10;
}

/** Mean of each review’s `averageNote`, or `null` if there are no reviews. */
export function averageRatingAcrossReviews(reviews: Review[]): number | null {
  if (!reviews.length) {
    return null;
  }
  const sum = reviews.reduce((acc, rv) => acc + averageNote(rv.note), 0);
  return roundToTenth(sum / reviews.length);
}

export type ReviewDimensionAverages = {
  food: number;
  service: number;
  value: number;
  atmosphere: number;
};

/** Per-dimension means over all reviews, or `null` if empty. */
export function dimensionAveragesFromReviews(
  reviews: Review[],
): ReviewDimensionAverages | null {
  if (!reviews.length) {
    return null;
  }
  const n = reviews.length;
  const food = reviews.reduce((a, r) => a + r.note.food, 0) / n;
  const service = reviews.reduce((a, r) => a + r.note.service, 0) / n;
  const value = reviews.reduce((a, r) => a + r.note.value, 0) / n;
  const atmosphere = reviews.reduce((a, r) => a + r.note.atmosphere, 0) / n;
  return {
    food: roundToTenth(food),
    service: roundToTenth(service),
    value: roundToTenth(value),
    atmosphere: roundToTenth(atmosphere),
  };
}

export function sortReviewsByAverageNoteDesc(reviews: Review[]): Review[] {
  return [...reviews].sort((a, b) => averageNote(b.note) - averageNote(a.note));
}
