import type { Restaurant, Review } from '../api/api.models';

function norm(s: string): string {
  return s.trim().toLowerCase();
}

/** Match reviews to a listing when API embeds restaurant snapshots (no stable FK). */
export function reviewBelongsToRestaurant(review: Review, restaurant: Restaurant): boolean {
  const rr = review.restaurant;
  if (rr.id === restaurant.id) return true;
  return (
    norm(rr.name) === norm(restaurant.name) &&
    norm(rr.address.city) === norm(restaurant.address.city) &&
    norm(rr.address.state) === norm(restaurant.address.state) &&
    norm(rr.address.country) === norm(restaurant.address.country)
  );
}

export function filterReviewsForRestaurant(reviews: Review[], restaurant: Restaurant): Review[] {
  return reviews.filter((r) => reviewBelongsToRestaurant(r, restaurant));
}

/** Average of the four note dimensions (0–5). */
export function averageNote(note: { service: number; food: number; value: number; atmosphere: number }): number {
  const n = (note.service + note.food + note.value + note.atmosphere) / 4;
  return Math.round(n * 10) / 10;
}
