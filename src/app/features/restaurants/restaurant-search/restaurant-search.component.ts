import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, finalize, take } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';
import { RestaurantApiService } from '../../../core/api/restaurant-api.service';
import type { Restaurant } from '../../../core/api/api.models';
import { AddRestaurantModalService } from '../add-restaurant-modal/add-restaurant-modal.service';

@Component({
  standalone: true,
  selector: 'app-restaurant-search',
  imports: [CommonModule],
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
    this.loadRestaurants();
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
          this.listError.set(this.formatHttpError(err));
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

  private formatHttpError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (typeof err.error === 'object' && err.error && 'message' in err.error) {
        const msg = (err.error as { message?: unknown }).message;
        if (typeof msg === 'string') return msg;
        if (Array.isArray(msg)) return msg.join(', ');
      }
      return err.message || `Request failed (${err.status})`;
    }
    return 'Something went wrong.';
  }
}
