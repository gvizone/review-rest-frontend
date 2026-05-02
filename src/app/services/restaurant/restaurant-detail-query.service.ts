import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import type { Restaurant, Review } from '../../domain/models';
import { filterReviewsForRestaurant } from '../../domain/review/review-match';
import { RestaurantApiService } from '../api/restaurant-api.service';
import { ReviewApiService } from '../api/review-api.service';

export interface RestaurantDetailPayload {
  restaurant: Restaurant;
  reviews: Review[];
}

@Injectable({ providedIn: 'root' })
export class RestaurantDetailQueryService {
  private readonly restaurantsApi = inject(RestaurantApiService);
  private readonly reviewsApi = inject(ReviewApiService);

  load(restaurantId: string): Observable<RestaurantDetailPayload> {
    return this.restaurantsApi.findById(restaurantId).pipe(
      switchMap((restaurant) =>
        this.reviewsApi.findAll().pipe(
          map((all) => ({
            restaurant,
            reviews: filterReviewsForRestaurant(all, restaurant),
          })),
        ),
      ),
    );
  }
}
