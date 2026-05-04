import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, distinctUntilChanged, finalize, take } from 'rxjs/operators';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../../services/auth/auth.service';
import { httpErrorUserMessage } from '../../../utils/http-error-message';
import { RestaurantApiService } from '../../../services/api/restaurant-api.service';
import type { Restaurant } from '../../../domain/models';
import { restaurantListLocationLine } from '../../../domain/restaurant/restaurant-display';
import { AddRestaurantModalService } from '../../../services/ui/add-restaurant-modal.service';

@Component({
  standalone: true,
  selector: 'app-restaurant-search',
  imports: [CommonModule, RouterLink, TranslocoPipe],
  templateUrl: './restaurant-search.component.html',
  styleUrl: './restaurant-search.component.scss',
})
export class RestaurantSearchComponent {
  private readonly auth = inject(AuthService);
  private readonly restaurantsApi = inject(RestaurantApiService);
  private readonly addRestaurantModal = inject(AddRestaurantModalService);

  /** Page size (must match default `limit` on `GET /restaurants/search`). */
  readonly pageSize = 9;

  /** Text in the search field (not submitted until the user clicks Search). */
  readonly draftQuery = signal('');

  /** Last submitted query (empty string = “show all” paginated). */
  readonly submittedQuery = signal<string | undefined>(undefined);

  readonly restaurants = signal<Restaurant[]>([]);
  readonly total = signal(0);
  readonly hasMore = signal(false);
  readonly hasSearched = signal(false);
  /** Last page number returned by the API (1-based). */
  readonly lastLoadedPage = signal(0);
  readonly listLoading = signal(false);
  readonly loadMoreLoading = signal(false);
  readonly listError = signal<string | null>(null);

  readonly userProfile = computed(() => this.auth.userProfile());

  /** Template: compact location for cards (same rules as domain helper). */
  protected readonly listLocationLine = restaurantListLocationLine;

  constructor() {
    this.auth.user$
      .pipe(
        distinctUntilChanged((a, b) => (a?.uid ?? '') === (b?.uid ?? '')),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.refreshLastSearch());

    this.addRestaurantModal.restaurantCreated.pipe(takeUntilDestroyed()).subscribe(() => {
      this.refreshLastSearch();
    });
  }

  setDraft(value: string): void {
    this.draftQuery.set(value);
  }

  runSearch(): void {
    const q = this.draftQuery().trim();
    this.submittedQuery.set(q);
    this.fetchPage(1, true);
  }

  loadMore(): void {
    if (!this.hasMore() || this.loadMoreLoading() || this.listLoading()) {
      return;
    }
    this.fetchPage(this.lastLoadedPage() + 1, false);
  }

  openAddRestaurantModal(): void {
    this.addRestaurantModal.open();
  }

  private refreshLastSearch(): void {
    if (!this.hasSearched()) {
      return;
    }
    this.fetchPage(1, true);
  }

  private fetchPage(page: number, replace: boolean): void {
    if (replace) {
      this.listLoading.set(true);
      this.hasSearched.set(true);
      this.listError.set(null);
      this.restaurants.set([]);
      this.total.set(0);
      this.hasMore.set(false);
    } else {
      this.loadMoreLoading.set(true);
    }

    const q = this.submittedQuery() ?? '';

    this.restaurantsApi
      .search({ q, page, limit: this.pageSize })
      .pipe(
        take(1),
        catchError((err: unknown) => {
          this.listError.set(httpErrorUserMessage(err));
          return of(null);
        }),
        finalize(() => {
          this.listLoading.set(false);
          this.loadMoreLoading.set(false);
        }),
      )
      .subscribe((res) => {
        if (!res) {
          return;
        }
        this.listError.set(null);
        this.total.set(res.total);
        this.hasMore.set(res.hasMore);
        this.lastLoadedPage.set(res.page);
        if (replace) {
          this.restaurants.set(res.items);
        } else {
          this.restaurants.update((prev) => [...prev, ...res.items]);
        }
      });
  }
}
