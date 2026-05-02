import { CommonModule } from '@angular/common';
import { Component, computed, inject, isDevMode, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { LoginModalService } from '../../../core/auth/login-modal.service';
import { httpErrorUserMessage } from '../../../core/api/http-error-user-message';
import { RestaurantApiService } from '../../../core/api/restaurant-api.service';
import { ReviewApiService } from '../../../core/api/review-api.service';
import type { Restaurant, Review } from '../../../core/api/api.models';
import {
  averageNote,
  filterReviewsForRestaurant,
  reviewBelongsToRestaurant,
} from '../../../core/reviews/review-belongs-to-restaurant';
import { CreateReviewModalService } from '../create-review-modal/create-review-modal.service';

@Component({
  standalone: true,
  selector: 'app-restaurant-detail-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './restaurant-detail.page.html',
  styleUrl: './restaurant-detail.page.scss',
})
export class RestaurantDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly restaurantsApi = inject(RestaurantApiService);
  private readonly reviewsApi = inject(ReviewApiService);
  private readonly auth = inject(AuthService);
  private readonly loginModal = inject(LoginModalService);
  private readonly createReviewModal = inject(CreateReviewModalService);

  /** Template helper (TripAdvisor-style overall score per review). */
  protected readonly avgNote = averageNote;

  readonly isDevMode = isDevMode();
  readonly userProfile = computed(() => this.auth.userProfile());

  readonly restaurant = signal<Restaurant | null>(null);
  readonly reviews = signal<Review[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly avgRating = computed(() => {
    const list = this.reviews();
    if (!list.length) return null;
    const sum = list.reduce((acc, rv) => acc + averageNote(rv.note), 0);
    return Math.round((sum / list.length) * 10) / 10;
  });

  readonly dimensionAverages = computed(() => {
    const list = this.reviews();
    if (!list.length) return null;
    const n = list.length;
    const food = list.reduce((a, r) => a + r.note.food, 0) / n;
    const service = list.reduce((a, r) => a + r.note.service, 0) / n;
    const value = list.reduce((a, r) => a + r.note.value, 0) / n;
    const atmosphere = list.reduce((a, r) => a + r.note.atmosphere, 0) / n;
    const round = (x: number) => Math.round(x * 10) / 10;
    return {
      food: round(food),
      service: round(service),
      value: round(value),
      atmosphere: round(atmosphere),
    };
  });

  constructor() {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(),
        map((p) => p.get('id')),
        switchMap((id) => {
          if (!id) {
            this.loading.set(false);
            this.restaurant.set(null);
            this.reviews.set([]);
            this.error.set('Missing restaurant id.');
            return of(null);
          }
          this.loading.set(true);
          this.error.set(null);
          return this.restaurantsApi.findById(id).pipe(
            switchMap((restaurant) =>
              this.reviewsApi.findAll().pipe(
                map((all) => ({
                  restaurant,
                  reviews: filterReviewsForRestaurant(all, restaurant),
                })),
              ),
            ),
            catchError((err: unknown) => {
              this.error.set(httpErrorUserMessage(err));
              this.restaurant.set(null);
              this.reviews.set([]);
              return of(null);
            }),
            finalize(() => this.loading.set(false)),
          );
        }),
      )
      .subscribe((data) => {
        if (!data) return;
        this.restaurant.set(data.restaurant);
        this.reviews.set(
          [...data.reviews].sort((a, b) => averageNote(b.note) - averageNote(a.note)),
        );
      });

    this.createReviewModal.reviewCreated.pipe(takeUntilDestroyed()).subscribe((rev) => {
      const r = this.restaurant();
      if (r && reviewBelongsToRestaurant(rev, r)) {
        this.reviews.update((list) =>
          [...list, rev].sort((a, b) => averageNote(b.note) - averageNote(a.note)),
        );
      }
    });
  }

  locationLine(r: Restaurant): string {
    const a = r.address;
    const parts = [a.street, a.city, a.state, a.country].filter(Boolean);
    return parts.join(', ');
  }

  login(): void {
    this.loginModal.open();
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigateByUrl('/home');
  }

  openReviewModal(): void {
    const r = this.restaurant();
    if (!r) return;
    if (!this.auth.userProfile()) {
      this.loginModal.open();
      return;
    }
    this.createReviewModal.open(r);
  }

  formatAddressBlock(r: Restaurant): string {
    const a = r.address;
    const lines: string[] = [];
    if (a.street) lines.push(a.street);
    lines.push([a.city, a.state].filter(Boolean).join(', '));
    lines.push(a.country);
    if (a.zipCode) lines.push(a.zipCode);
    return lines.filter(Boolean).join('\n');
  }
}
