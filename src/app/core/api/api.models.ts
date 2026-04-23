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
}

export interface User {
  id: string;
  name: string;
  email: string;
  address: Address;
}

export interface ReviewNote {
  service: number;
  food: number;
  value: number;
  atmosphere: number;
}

export interface CreateReviewRequest {
  user: CreateUserRequest;
  restaurant: CreateRestaurantRequest;
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
