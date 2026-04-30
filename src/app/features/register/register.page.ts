import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, take } from 'rxjs/operators';
import { AuthService } from '../../core/auth/auth.service';
import { UserApiService } from '../../core/api/user-api.service';

@Component({
  standalone: true,
  selector: 'app-register-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
})
export class RegisterPage {
  private readonly auth = inject(AuthService);
  private readonly userApi = inject(UserApiService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.group({
    name: [{ value: '', disabled: true }],
    email: [{ value: '', disabled: true }],
    address: this.fb.group({
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
    }),
  });

  submitting = false;
  errorMessage: string | null = null;

  constructor() {
    effect(() => {
      const p = this.auth.userProfile();
      if (!p) return;
      this.form.patchValue(
        { name: p.displayName ?? '', email: p.email ?? '' },
        { emitEvent: false },
      );
    });
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
      })
      .pipe(
        take(1),
        finalize(() => {
          this.submitting = false;
        }),
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/home');
        },
        error: (err: unknown) => {
          this.errorMessage = this.formatError(err);
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
