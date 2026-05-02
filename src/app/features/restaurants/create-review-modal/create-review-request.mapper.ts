import type { CreateReviewRequest, Restaurant, User } from '../../../core/api/api.models';
import type { CreateReviewFormValue } from './create-review-form.build';

function clampNote(n: number): number {
  if (Number.isNaN(n)) return 1;
  return Math.min(5, Math.max(1, n));
}

export function mapCreateReviewFormToRequest(
  value: CreateReviewFormValue,
  user: User,
  restaurant: Restaurant,
  imageDataUrls: string[],
): CreateReviewRequest {
  return {
    userId: user.id,
    restaurantId: restaurant.id,
    note: {
      service: clampNote(Number(value.service)),
      food: clampNote(Number(value.food)),
      value: clampNote(Number(value.value)),
      atmosphere: clampNote(Number(value.atmosphere)),
    },
    images: [...imageDataUrls],
    ...(value.commentary?.trim() ? { commentary: value.commentary.trim() } : {}),
  };
}
