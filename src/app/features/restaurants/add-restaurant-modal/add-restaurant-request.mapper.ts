import type { CreateRestaurantRequest } from '../../../domain/models';
import type { AddRestaurantFormValue } from './add-restaurant-form.build';

export type MapAddRestaurantResult =
  | { ok: true; body: CreateRestaurantRequest }
  | { ok: false; messageKey: string };

export function mapAddRestaurantFormToRequest(
  value: AddRestaurantFormValue,
  imageDataUrls: string[],
): MapAddRestaurantResult {
  const categoryNames = (value.categories ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!categoryNames.length) {
    return { ok: false, messageKey: 'addRestaurant.validation.categories' };
  }

  const a = value.address;
  const body: CreateRestaurantRequest = {
    name: (value.name ?? '').trim(),
    address: {
      city: (a?.city ?? '').trim(),
      state: (a?.state ?? '').trim(),
      country: (a?.country ?? '').trim(),
      ...((value.street ?? '').trim() ? { street: (value.street ?? '').trim() } : {}),
      ...((value.zipCode ?? '').trim() ? { zipCode: (value.zipCode ?? '').trim() } : {}),
    },
    categories: categoryNames.map((name) => ({ name })),
    ...((value.instagram ?? '').trim() ? { instagram: (value.instagram ?? '').trim() } : {}),
    ...(imageDataUrls.length ? { images: [...imageDataUrls] } : {}),
  };

  return { ok: true, body };
}
