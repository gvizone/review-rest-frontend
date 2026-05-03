import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, distinctUntilChanged, finalize, take } from 'rxjs/operators';
import { AuthService } from '../../../services/auth/auth.service';
import { httpErrorUserMessage } from '../../../utils/http-error-message';
import { RestaurantApiService } from '../../../services/api/restaurant-api.service';
import type { Restaurant } from '../../../domain/models';
import { AddRestaurantModalService } from '../../../services/ui/add-restaurant-modal.service';
import { TranslocoPipe } from '@jsverse/transloco';

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

  readonly searchQuery = signal('');
  readonly restaurants = signal<Restaurant[]>([]);
  readonly listLoading = signal(false);
  readonly listError = signal<string | null>(null);

  readonly userProfile = computed(() => this.auth.userProfile());

  readonly filteredRestaurants = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const all = this.restaurants();
    if (!q) return all;
    return all.filter((r) => {
      const haystack = [
        r.name,
        r.address.city,
        r.address.state,
        r.address.country,
        ...r.categories.map((c) => c.name),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  });

  constructor() {
    this.auth.user$
      .pipe(
        distinctUntilChanged((a, b) => (a?.uid ?? '') === (b?.uid ?? '')),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.loadRestaurants());

    this.addRestaurantModal.restaurantCreated
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadRestaurants());
  }

  setSearch(value: string): void {
    this.searchQuery.set(value);
  }

  openAddRestaurantModal(): void {
    this.addRestaurantModal.open();
  }

  loadRestaurants(): void {
    this.listError.set(null);
    this.listLoading.set(true);
    this.restaurantsApi
      .findAll()
      .pipe(
        take(1),
        catchError((err: unknown) => {
          this.listError.set(httpErrorUserMessage(err));
          return of([] as Restaurant[]);
        }),
        finalize(() => this.listLoading.set(false)),
      )
      .subscribe((list) => this.restaurants.set(list));
  }

  locationLine(r: Restaurant): string {
    const a = r.address;
    const parts = [a.city, a.state, a.country].filter(Boolean);
    return parts.join(', ');
  }

}
