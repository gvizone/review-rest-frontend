import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize, take } from 'rxjs/operators';
import { AddRestaurantModalService } from './add-restaurant-modal.service';
import { AuthService } from '../../../core/auth/auth.service';
import { CreateRestaurantRequest } from '../../../core/api/api.models';
import { RestaurantApiService } from '../../../core/api/restaurant-api.service';

@Component({
  standalone: true,
  selector: 'app-add-restaurant-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-restaurant-modal.component.html',
  styleUrl: './add-restaurant-modal.component.scss',
})
export class AddRestaurantModalComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly restaurantsApi = inject(RestaurantApiService);
  private readonly fb = inject(FormBuilder);
  protected readonly modal = inject(AddRestaurantModalService);

  readonly submitLoading = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    street: [''],
    city: ['', Validators.required],
    state: ['', Validators.required],
    country: ['', Validators.required],
    zipCode: [''],
    categories: ['', Validators.required],
    instagram: [''],
    images: [''],
  });

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
      void this.router.navigateByUrl('/login');
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const categoryNames = v.categories
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!categoryNames.length) {
      this.submitError.set('Add at least one category (comma-separated).');
      return;
    }
    const imageUrls = v.images
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const body: CreateRestaurantRequest = {
      name: v.name.trim(),
      address: {
        city: v.city.trim(),
        state: v.state.trim(),
        country: v.country.trim(),
        ...(v.street.trim() ? { street: v.street.trim() } : {}),
        ...(v.zipCode.trim() ? { zipCode: v.zipCode.trim() } : {}),
      },
      categories: categoryNames.map((name) => ({ name })),
      ...(v.instagram.trim() ? { instagram: v.instagram.trim() } : {}),
      ...(imageUrls.length ? { images: imageUrls } : {}),
    };

    this.submitLoading.set(true);
    this.restaurantsApi
      .create(body)
      .pipe(
        take(1),
        finalize(() => this.submitLoading.set(false)),
        catchError((err: unknown) => {
          this.submitError.set(this.formatHttpError(err));
          return of(null);
        }),
      )
      .subscribe((created) => {
        if (!created) return;
        this.form.reset({
          name: '',
          street: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
          categories: '',
          instagram: '',
          images: '',
        });
        this.modal.restaurantCreated.next(created);
        this.modal.close();
      });
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
