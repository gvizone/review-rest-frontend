import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { ICity, ICountry, IState } from '@countrystatecity/countries';
import { of } from 'rxjs';
import { catchError, finalize, take } from 'rxjs/operators';
import { AddRestaurantModalService } from './add-restaurant-modal.service';
import {
  type AddRestaurantFormValue,
  buildAddRestaurantForm,
  emptyAddRestaurantFormValue,
} from './add-restaurant-form.build';
import { mapAddRestaurantFormToRequest } from './add-restaurant-request.mapper';
import { AuthService } from '../../../core/auth/auth.service';
import { LoginModalService } from '../../../core/auth/login-modal.service';
import { httpErrorUserMessage } from '../../../core/api/http-error-user-message';
import { RestaurantApiService } from '../../../core/api/restaurant-api.service';
import { AddressFormCascadeService } from '../../../core/location/address-form-cascade.service';

@Component({
  standalone: true,
  selector: 'app-add-restaurant-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-restaurant-modal.component.html',
  styleUrl: './add-restaurant-modal.component.scss',
})
export class AddRestaurantModalComponent {
  private readonly auth = inject(AuthService);
  private readonly loginModal = inject(LoginModalService);
  private readonly restaurantsApi = inject(RestaurantApiService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly addressCascade = inject(AddressFormCascadeService);
  protected readonly modal = inject(AddRestaurantModalService);

  readonly submitLoading = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly countries = signal<ICountry[]>([]);
  readonly states = signal<IState[]>([]);
  readonly cities = signal<ICity[]>([]);

  readonly form = buildAddRestaurantForm(this.fb);

  constructor() {
    const address = this.form.get('address') as FormGroup;
    this.addressCascade.connect(address, {
      countries: this.countries,
      states: this.states,
      cities: this.cities,
    }, this.destroyRef);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.dismiss();
    }
  }

  dismiss(): void {
    this.submitError.set(null);
    this.modal.close();
  }

  submit(): void {
    this.submitError.set(null);
    if (!this.auth.userProfile()) {
      this.modal.close();
      this.loginModal.open();
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const mapped = mapAddRestaurantFormToRequest(this.form.getRawValue() as AddRestaurantFormValue);
    if (!mapped.ok) {
      this.submitError.set(mapped.message);
      return;
    }

    this.submitLoading.set(true);
    this.restaurantsApi
      .create(mapped.body)
      .pipe(
        take(1),
        finalize(() => this.submitLoading.set(false)),
        catchError((err: unknown) => {
          this.submitError.set(httpErrorUserMessage(err));
          return of(null);
        }),
      )
      .subscribe((created) => {
        if (!created) return;
        this.form.reset(emptyAddRestaurantFormValue());
        this.states.set([]);
        this.cities.set([]);
        this.modal.restaurantCreated.next(created);
        this.modal.close();
      });
  }
}
