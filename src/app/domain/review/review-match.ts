import type { Restaurant, Review } from '../models';

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
