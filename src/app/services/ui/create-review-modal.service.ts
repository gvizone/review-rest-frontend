import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import type { Restaurant, Review } from '../../domain/models';

@Injectable({ providedIn: 'root' })
export class CreateReviewModalService {
  private readonly _isOpen = signal(false);
  readonly isOpen = this._isOpen.asReadonly();

  private readonly _restaurant = signal<Restaurant | null>(null);
  readonly restaurant = this._restaurant.asReadonly();

  readonly reviewCreated = new Subject<Review>();

  open(restaurant: Restaurant): void {
    this._restaurant.set(restaurant);
    this._isOpen.set(true);
  }

  close(): void {
    this._isOpen.set(false);
    this._restaurant.set(null);
  }
}
