import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { ICity, ICountry, IState } from '@countrystatecity/countries';
import { of } from 'rxjs';
import { catchError, finalize, take } from 'rxjs/operators';
import { AddRestaurantModalService } from '../../../services/ui/add-restaurant-modal.service';
import {
  type AddRestaurantFormValue,
  buildAddRestaurantForm,
  emptyAddRestaurantFormValue,
} from './add-restaurant-form.build';
import { mapAddRestaurantFormToRequest } from './add-restaurant-request.mapper';
import { AuthService } from '../../../services/auth/auth.service';
import { LoginModalService } from '../../../services/ui/login-modal.service';
import { httpErrorUserMessage } from '../../../utils/http-error-message';
import { RestaurantApiService } from '../../../services/api/restaurant-api.service';
import { AddressFormCascadeService } from '../../../services/location/address-form-cascade.service';
import { readFilesAsDataUrls } from '../../../utils/image-file';
import { isModalBackdropClick } from '../../../utils/modal-backdrop';
import { translateImagePickFailure } from '../../../utils/transloco-image-error';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
  standalone: true,
  selector: 'app-add-restaurant-modal',
  imports: [CommonModule, ReactiveFormsModule, TranslocoPipe],
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
  private readonly transloco = inject(TranslocoService);

  readonly submitLoading = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly countries = signal<ICountry[]>([]);
  readonly states = signal<IState[]>([]);
  readonly cities = signal<ICity[]>([]);

  /** Data URLs from device photos (stored as base64 on API). */
  readonly restaurantImages = signal<string[]>([]);

  readonly form = buildAddRestaurantForm(this.fb);

  constructor() {
    const address = this.form.get('address') as FormGroup;
    this.addressCascade.connect(
      address,
      {
        countries: this.countries,
        states: this.states,
        cities: this.cities,
      },
      this.destroyRef,
    );
  }

  onBackdropClick(event: MouseEvent): void {
    if (isModalBackdropClick(event)) {
      this.dismiss();
    }
  }

  dismiss(): void {
    this.submitError.set(null);
    this.restaurantImages.set([]);
    this.modal.close();
  }

  async onRestaurantPhotosSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) return;
    try {
      const urls = await readFilesAsDataUrls(files);
      this.restaurantImages.update((prev) => [...prev, ...urls]);
    } catch (e) {
      this.submitError.set(translateImagePickFailure(this.transloco, e, 'multi'));
    }
  }

  removeRestaurantPhoto(index: number): void {
    this.restaurantImages.update((prev) => prev.filter((_, i) => i !== index));
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

    const mapped = mapAddRestaurantFormToRequest(
      this.form.getRawValue() as AddRestaurantFormValue,
      this.restaurantImages(),
    );
    if (!mapped.ok) {
      this.submitError.set(this.transloco.translate(mapped.messageKey));
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
        this.restaurantImages.set([]);
        this.states.set([]);
        this.cities.set([]);
        this.modal.restaurantCreated.next(created);
        this.modal.close();
      });
  }
}
