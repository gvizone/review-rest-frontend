import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import type { ICity, ICountry, IState } from '@countrystatecity/countries';
import { finalize, take } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';
import { RegisterModalService } from '../../services/ui/register-modal.service';
import { UserApiService } from '../../services/api/user-api.service';
import { AddressFormCascadeService } from '../../services/location/address-form-cascade.service';
import { readFileAsDataUrl } from '../../utils/image-file';
import { httpErrorUserMessage } from '../../utils/http-error-message';

@Component({
  standalone: true,
  selector: 'app-register-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-modal.component.html',
  styleUrl: './register-modal.component.scss',
})
export class RegisterModalComponent {
  private readonly auth = inject(AuthService);
  private readonly userApi = inject(UserApiService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly addressCascade = inject(AddressFormCascadeService);
  protected readonly registerModal = inject(RegisterModalService);

  protected readonly form = this.fb.group({
    name: [{ value: '', disabled: true }],
    email: [{ value: '', disabled: true }],
    address: this.fb.group({
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
    }),
  });

  readonly countries = signal<ICountry[]>([]);
  readonly states = signal<IState[]>([]);
  readonly cities = signal<ICity[]>([]);

  submitting = false;
  errorMessage: string | null = null;

  /** Single profile photo as data URL (optional). */
  profileImageDataUrl: string | null = null;

  constructor() {
    effect(() => {
      const p = this.auth.userProfile();
      if (!p) return;
      this.form.patchValue(
        { name: p.displayName ?? '', email: p.email ?? '' },
        { emitEvent: false },
      );
    });

    this.addressCascade.connect(this.form.controls.address, {
      countries: this.countries,
      states: this.states,
      cities: this.cities,
    }, this.destroyRef);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.registerModal.close(); // cancels registration → sign out
    }
  }

  async onProfilePhotoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    try {
      this.profileImageDataUrl = await readFileAsDataUrl(file);
      this.errorMessage = null;
    } catch (e) {
      this.errorMessage = e instanceof Error ? e.message : 'Could not read image.';
    }
  }

  clearProfilePhoto(): void {
    this.profileImageDataUrl = null;
  }

  submit(): void {
    this.errorMessage = null;
    this.form.markAllAsTouched();

    const addressGroup = this.form.controls.address;
    if (addressGroup.invalid) return;

    const raw = this.form.getRawValue();
    const name = (raw.name ?? '').trim();
    const email = (raw.email ?? '').trim();

    if (!email) {
      this.errorMessage = 'No email on your account. Sign out and try again.';
      return;
    }
    if (!name) {
      this.errorMessage =
        'Your account has no display name. Update it in your Google profile, then try again.';
      return;
    }

    const a = raw.address;
    this.submitting = true;
    this.userApi
      .create({
        name,
        email,
        address: {
          city: (a.city ?? '').trim(),
          state: (a.state ?? '').trim(),
          country: (a.country ?? '').trim(),
        },
        ...(this.profileImageDataUrl ? { image: this.profileImageDataUrl } : {}),
      })
      .pipe(
        take(1),
        finalize(() => {
          this.submitting = false;
        }),
      )
      .subscribe({
        next: () => {
          this.profileImageDataUrl = null;
          this.registerModal.closeAfterSuccessfulRegistration();
          void this.router.navigateByUrl('/home');
        },
        error: (err: unknown) => {
          this.errorMessage = httpErrorUserMessage(err);
          this.registerModal.close(); // failed registration → sign out
        },
      });
  }
}
