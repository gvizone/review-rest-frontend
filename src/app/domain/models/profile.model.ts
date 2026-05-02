import type { Restaurant } from './restaurant.model';
import type { Review } from './review.model';
import type { User } from './user.model';

/** GET /profile/me */
export interface UserProfileResponse {
  user: User;
  reviews: Review[];
  visitedRestaurants: Restaurant[];
}
