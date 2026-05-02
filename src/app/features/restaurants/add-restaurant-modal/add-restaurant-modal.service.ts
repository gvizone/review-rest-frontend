import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { Restaurant } from '../../../core/api/api.models';

@Injectable({ providedIn: 'root' })
export class AddRestaurantModalService {
  private readonly _isOpen = signal(false);
  readonly isOpen = this._isOpen.asReadonly();
  readonly restaurantCreated = new Subject<Restaurant>();

  open(): void {
    this._isOpen.set(true);
  }

  close(): void {
    this._isOpen.set(false);
  }
}
