import type { Restaurant } from './restaurant.model';
import type { User } from './user.model';

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
