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
): CreateReviewRequest {
  const imageUrls = (value.images ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    user: {
      name: user.name,
      email: user.email,
      address: { ...user.address },
    },
    restaurant: {
      name: restaurant.name,
      address: { ...restaurant.address },
      categories: restaurant.categories.map((c) => ({ name: c.name })),
      ...(restaurant.instagram?.trim() ? { instagram: restaurant.instagram.trim() } : {}),
      ...(restaurant.images?.length ? { images: [...restaurant.images] } : {}),
    },
    note: {
      service: clampNote(Number(value.service)),
      food: clampNote(Number(value.food)),
      value: clampNote(Number(value.value)),
      atmosphere: clampNote(Number(value.atmosphere)),
    },
    images: imageUrls,
    ...(value.commentary?.trim() ? { commentary: value.commentary.trim() } : {}),
  };
}
