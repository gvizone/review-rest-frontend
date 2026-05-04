import type { Address } from './address.model';
import type { Category } from './category.model';

export interface CreateRestaurantRequest {
  name: string;
  address: Address;
  categories: Category[];
  instagram?: string;
  images?: string[];
  about?: string;
}

/** `PATCH /restaurants/:id` — only include fields to change. */
export type UpdateRestaurantRequest = Partial<
  Pick<
    CreateRestaurantRequest,
    'name' | 'address' | 'categories' | 'instagram' | 'images' | 'about'
  >
>;

export interface Restaurant {
  id: string;
  name: string;
  address: Address;
  categories: Category[];
  instagram?: string;
  images?: string[];
  about?: string;
}

/** Paginated `GET /restaurants/search` response. */
export interface RestaurantSearchPage {
  items: Restaurant[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
