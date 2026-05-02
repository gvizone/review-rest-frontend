import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs';
import { httpErrorUserMessage } from '../../core/api/http-error-user-message';
import type { UserProfileResponse } from '../../core/api/api.models';
import { ProfileApiService } from '../../core/api/profile-api.service';
import { RegisterModalService } from '../../core/auth/register-modal.service';
import { AppTopbarComponent } from '../../core/layout/app-topbar.component';
import { averageNote } from '../../core/reviews/review-belongs-to-restaurant';
import { readFileAsDataUrl } from '../../core/util/image-file.util';

@Component({
  standalone: true,
  selector: 'app-profile-page',
  imports: [CommonModule, RouterLink, AppTopbarComponent],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
})
export class ProfilePage {
  private readonly profileApi = inject(ProfileApiService);
  private readonly registerModal = inject(RegisterModalService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly profile = signal<UserProfileResponse | null>(null);
  readonly imageSaving = signal(false);
  readonly imageError = signal<string | null>(null);

  readonly averageNote = averageNote;

  readonly showRegisterCta = computed(() => {
    const e = this.error();
    return !!e && e.toLowerCase().includes('registration');
  });

  constructor() {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.error.set(null);
    this.profileApi
      .getMyProfile()
      .pipe(
        take(1),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (p) => {
          this.profile.set(p);
          this.error.set(null);
        },
        error: (err: unknown) => {
          this.profile.set(null);
          this.error.set(httpErrorUserMessage(err));
        },
      });
  }

  openRegister(): void {
    this.registerModal.open();
  }

  async onPhotoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    let dataUrl: string;
    try {
      dataUrl = await readFileAsDataUrl(file);
    } catch (e) {
      this.imageError.set(e instanceof Error ? e.message : 'Could not read image.');
      return;
    }
    this.imageError.set(null);
    this.imageSaving.set(true);
    this.profileApi
      .updateMyProfileImage(dataUrl)
      .pipe(
        take(1),
        finalize(() => this.imageSaving.set(false)),
      )
      .subscribe({
        next: (user) => {
          this.profile.update((p) => (p ? { ...p, user } : null));
        },
        error: (err: unknown) => {
          this.imageError.set(httpErrorUserMessage(err));
        },
      });
  }

  clearPhoto(): void {
    this.imageError.set(null);
    this.imageSaving.set(true);
    this.profileApi
      .updateMyProfileImage('')
      .pipe(
        take(1),
        finalize(() => this.imageSaving.set(false)),
      )
      .subscribe({
        next: (user) => {
          this.profile.update((p) => (p ? { ...p, user } : null));
        },
        error: (err: unknown) => {
          this.imageError.set(httpErrorUserMessage(err));
        },
      });
  }
}
