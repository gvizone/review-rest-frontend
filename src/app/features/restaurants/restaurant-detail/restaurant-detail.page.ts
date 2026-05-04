import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { LoginModalService } from '../../../services/ui/login-modal.service';
import { httpErrorUserMessage } from '../../../utils/http-error-message';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AppTopbarComponent } from '../../../core/layout/app-topbar.component';
import type { Restaurant, Review } from '../../../domain/models';
import { averageNote } from '../../../domain/review/review-rating';
import {
  averageRatingAcrossReviews,
  dimensionAveragesFromReviews,
  sortReviewsByAverageNoteDesc,
} from '../../../domain/review/review-aggregate';
import { reviewBelongsToRestaurant } from '../../../domain/review/review-match';
import {
  restaurantAddressBlock,
  restaurantLocationLine,
} from '../../../domain/restaurant/restaurant-display';
import { RestaurantDetailQueryService } from '../../../services/restaurant/restaurant-detail-query.service';
import { CreateReviewModalService } from '../../../services/ui/create-review-modal.service';

@Component({
  standalone: true,
  selector: 'app-restaurant-detail-page',
  imports: [CommonModule, RouterLink, TranslocoPipe, AppTopbarComponent],
  templateUrl: './restaurant-detail.page.html',
  styleUrl: './restaurant-detail.page.scss',
})
export class RestaurantDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly detailQuery = inject(RestaurantDetailQueryService);
  private readonly auth = inject(AuthService);
  private readonly loginModal = inject(LoginModalService);
  private readonly createReviewModal = inject(CreateReviewModalService);
  private readonly transloco = inject(TranslocoService);

  /** Template helper (TripAdvisor-style overall score per review). */
  protected readonly avgNote = averageNote;

  readonly restaurant = signal<Restaurant | null>(null);
  readonly reviews = signal<Review[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly avgRating = computed(() =>
    averageRatingAcrossReviews(this.reviews()),
  );

  readonly dimensionAverages = computed(() =>
    dimensionAveragesFromReviews(this.reviews()),
  );

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
            this.error.set(this.transloco.translate('detail.missingRestaurantId'));
            return of(null);
          }
          this.loading.set(true);
          this.error.set(null);
          return this.detailQuery.load(id).pipe(
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
        this.reviews.set(sortReviewsByAverageNoteDesc(data.reviews));
      });

    this.createReviewModal.reviewCreated.pipe(takeUntilDestroyed()).subscribe((rev) => {
      const r = this.restaurant();
      if (r && reviewBelongsToRestaurant(rev, r)) {
        this.reviews.update((list) => sortReviewsByAverageNoteDesc([...list, rev]));
      }
    });
  }

  locationLine(r: Restaurant): string {
    return restaurantLocationLine(r);
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
    return restaurantAddressBlock(r);
  }
}
