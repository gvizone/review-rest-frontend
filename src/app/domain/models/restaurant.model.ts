import type { Address } from './address.model';
import type { Category } from './category.model';

export interface CreateRestaurantRequest {
  name: string;
  address: Address;
  categories: Category[];
  instagram?: string;
  images?: string[];
}

export interface Restaurant {
  id: string;
  name: string;
  address: Address;
  categories: Category[];
  instagram?: string;
  images?: string[];
}

/** Paginated `GET /restaurants/search` response. */
export interface RestaurantSearchPage {
  items: Restaurant[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
