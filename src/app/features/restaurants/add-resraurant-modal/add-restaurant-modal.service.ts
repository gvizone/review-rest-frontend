import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { Restaurant } from '../../../core/api/api.models';

@Injectable({ providedIn: 'root' })
export class AddRestaurantModalService {
  private readonly _isOpen = signal(false);

  readonly isOpen = this._isOpen.asReadonly();

  /** Emits after a restaurant is successfully created (any subscriber can refresh lists, etc.). */
  readonly restaurantCreated = new Subject<Restaurant>();

  open(): void {
    this._isOpen.set(true);
  }

  close(): void {
    this._isOpen.set(false);
  }
}
