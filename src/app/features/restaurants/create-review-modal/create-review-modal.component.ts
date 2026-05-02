import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { catchError, finalize, switchMap, take } from 'rxjs/operators';
import { CreateReviewModalService } from '../../../services/ui/create-review-modal.service';
import {
  buildCreateReviewForm,
  emptyCreateReviewFormValue,
  type CreateReviewFormValue,
} from './create-review-form.build';
import { mapCreateReviewFormToRequest } from './create-review-request.mapper';
import { httpErrorUserMessage } from '../../../utils/http-error-message';
import { ReviewApiService } from '../../../services/api/review-api.service';
import { UserApiService } from '../../../services/api/user-api.service';
import { AuthService } from '../../../services/auth/auth.service';
import { LoginModalService } from '../../../services/ui/login-modal.service';
import { RegisterModalService } from '../../../services/ui/register-modal.service';
import { readFilesAsDataUrls } from '../../../utils/image-file';

@Component({
  standalone: true,
  selector: 'app-create-review-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-review-modal.component.html',
  styleUrl: './create-review-modal.component.scss',
})
export class CreateReviewModalComponent {
  private readonly auth = inject(AuthService);
  private readonly loginModal = inject(LoginModalService);
  private readonly registerModal = inject(RegisterModalService);
  private readonly userApi = inject(UserApiService);
  private readonly reviewsApi = inject(ReviewApiService);
  private readonly fb = inject(FormBuilder);
  protected readonly modal = inject(CreateReviewModalService);

  readonly submitLoading = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly form = buildCreateReviewForm(this.fb);

  readonly reviewImages = signal<string[]>([]);

  readonly ratingLabels = [
    { key: 'food' as const, label: 'Food' },
    { key: 'service' as const, label: 'Service' },
    { key: 'value' as const, label: 'Value' },
    { key: 'atmosphere' as const, label: 'Atmosphere' },
  ];

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.dismiss();
    }
  }

  dismiss(): void {
    this.submitError.set(null);
    this.reviewImages.set([]);
    this.modal.close();
  }

  async onReviewPhotosSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    input.value = '';
    if (!files?.length) return;
    try {
      const urls = await readFilesAsDataUrls(files);
      this.reviewImages.update((prev) => [...prev, ...urls]);
    } catch (e) {
      this.submitError.set(e instanceof Error ? e.message : 'Could not read images.');
    }
  }

  removeReviewPhoto(index: number): void {
    this.reviewImages.update((prev) => prev.filter((_, i) => i !== index));
  }

  openRegisterModal(): void {
    this.registerModal.open();
  }

  submit(): void {
    this.submitError.set(null);
    const restaurant = this.modal.restaurant();
    if (!restaurant) return;

    const profile = this.auth.userProfile();
    if (!profile?.email) {
      this.modal.close();
      this.loginModal.open();
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = profile.email;
    this.submitLoading.set(true);
    this.userApi
      .findByEmail(email)
      .pipe(
        take(1),
        catchError(() => of(null)),
        switchMap((user) => {
          if (!user) {
            this.submitError.set(
              'Complete your profile registration before writing a review.',
            );
            return of(null);
          }
          const body = mapCreateReviewFormToRequest(
            this.form.getRawValue() as CreateReviewFormValue,
            user,
            restaurant,
            this.reviewImages(),
          );
          return this.reviewsApi.create(body).pipe(
            take(1),
            catchError((err: unknown) => {
              this.submitError.set(httpErrorUserMessage(err));
              return of(null);
            }),
          );
        }),
        finalize(() => this.submitLoading.set(false)),
      )
      .subscribe((created) => {
        if (!created) return;
        this.form.reset(emptyCreateReviewFormValue());
        this.reviewImages.set([]);
        this.modal.reviewCreated.next(created);
        this.modal.close();
      });
  }
}
