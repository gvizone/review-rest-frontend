/** Shapes aligned with review-rest-backend entities and create DTOs. */

export interface Address {
  street?: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
}

export interface Category {
  name: string;
}

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

export interface CreateUserRequest {
  name: string;
  email: string;
  address: Address;
  /** Data URL or base64 from uploaded image (optional). */
  image?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  address: Address;
  image?: string;
}

export interface ReviewNote {
  service: number;
  food: number;
  value: number;
  atmosphere: number;
}

export interface CreateReviewRequest {
  userId: string;
  restaurantId: string;
  note: ReviewNote;
  commentary?: string;
  images: string[];
}

export interface Review {
  id: string;
  user: User;
  restaurant: Restaurant;
  note: ReviewNote;
  commentary?: string;
  images: string[];
}

/** GET /profile/me */
export interface UserProfileResponse {
  user: User;
  reviews: Review[];
  visitedRestaurants: Restaurant[];
}
