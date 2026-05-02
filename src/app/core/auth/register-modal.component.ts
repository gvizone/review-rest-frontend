import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import type { ICity, ICountry, IState } from '@countrystatecity/countries';
import { from } from 'rxjs';
import { distinctUntilChanged, finalize, switchMap, take, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { RegisterModalService } from './register-modal.service';
import { UserApiService } from '../api/user-api.service';
import { LocationDataService } from '../location/location-data.service';
import { readFileAsDataUrl } from '../util/image-file.util';

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
  private readonly locationData = inject(LocationDataService);
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

    void this.locationData
      .getCountries()
      .then((list) =>
        this.countries.set([...list].sort((a, b) => a.name.localeCompare(b.name))),
      );

    const addr = this.form.controls.address;

    addr.controls.country.valueChanges
      .pipe(
        takeUntilDestroyed(),
        distinctUntilChanged(),
        tap(() => {
          addr.patchValue({ state: '', city: '' }, { emitEvent: false });
          this.states.set([]);
          this.cities.set([]);
        }),
        switchMap((countryName) => {
          const c = this.countries().find((x) => x.name === countryName);
          if (!c) return from(Promise.resolve([] as IState[]));
          return from(this.locationData.getStatesOfCountry(c));
        }),
      )
      .subscribe((states) =>
        this.states.set([...states].sort((a, b) => a.name.localeCompare(b.name))),
      );

    addr.controls.state.valueChanges
      .pipe(
        takeUntilDestroyed(),
        distinctUntilChanged(),
        tap(() => {
          addr.patchValue({ city: '' }, { emitEvent: false });
          this.cities.set([]);
        }),
        switchMap((stateName) => {
          const countryName = addr.controls.country.value;
          const c = this.countries().find((x) => x.name === countryName);
          const s = this.states().find((x) => x.name === stateName);
          if (!c || !s) return from(Promise.resolve([] as ICity[]));
          return from(this.locationData.getCitiesOfState(c, s));
        }),
      )
      .subscribe((cities) =>
        this.cities.set([...cities].sort((a, b) => a.name.localeCompare(b.name))),
      );
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
          this.errorMessage = this.formatError(err);
          this.registerModal.close(); // failed registration → sign out
        },
      });
  }

  private formatError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (typeof err.error === 'object' && err.error && 'message' in err.error) {
        const msg = (err.error as { message?: unknown }).message;
        if (typeof msg === 'string') return msg;
        if (Array.isArray(msg)) return msg.join(', ');
      }
      return err.message || `Request failed (${err.status})`;
    }
    return 'Something went wrong. Please try again.';
  }
}
