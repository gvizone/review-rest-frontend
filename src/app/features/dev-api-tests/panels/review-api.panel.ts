import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ReviewApiService } from '../../../core/api/review-api.service';
import type { CreateReviewRequest } from '../../../core/api/api.models';
import { formatHttpError } from '../format-http-error';

function clampNote(n: number | string): number {
  const v = typeof n === 'string' ? Number(n) : n;
  if (Number.isNaN(v)) return 0;
  return Math.min(5, Math.max(0, v));
}

@Component({
  standalone: true,
  selector: 'app-review-api-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './review-api.panel.html',
  styleUrl: './review-api.panel.scss',
})
export class ReviewApiPanel {
  private readonly api = inject(ReviewApiService);

  readonly loading = signal(false);
  readonly responseText = signal('');

  queryId = '';

  /** Use ids from GET /users (mock: e.g. mock-user-1). */
  userId = '';
  /** Use ids from GET /restaurants (mock: e.g. mock-restaurant-1). */
  restaurantId = '';

  nService = 4;
  nFood = 4;
  nValue = 3;
  nAtmosphere = 4;
  commentary = 'Great spot.';
  images = '';

  private setBusy(): void {
    this.loading.set(true);
    this.responseText.set('');
  }

  private handleResult(data: unknown): void {
    this.responseText.set(JSON.stringify(data, null, 2));
  }

  private handleError(err: unknown): void {
    this.responseText.set(formatHttpError(err));
  }

  getAll(): void {
    this.setBusy();
    this.api
      .findAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (d) => this.handleResult(d),
        error: (e) => this.handleError(e),
      });
  }

  getById(): void {
    const id = this.queryId.trim();
    if (!id) {
      this.responseText.set('Enter an id.');
      return;
    }
    this.setBusy();
    this.api
      .findById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (d) => this.handleResult(d),
        error: (e) => this.handleError(e),
      });
  }

  create(): void {
    const userId = this.userId.trim();
    const restaurantId = this.restaurantId.trim();
    if (!userId || !restaurantId) {
      this.responseText.set('User id and restaurant id are required (copy from GET all).');
      return;
    }
    const revImgs = this.images
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const body: CreateReviewRequest = {
      userId,
      restaurantId,
      note: {
        service: clampNote(this.nService),
        food: clampNote(this.nFood),
        value: clampNote(this.nValue),
        atmosphere: clampNote(this.nAtmosphere),
      },
      images: revImgs,
      ...(this.commentary.trim() ? { commentary: this.commentary.trim() } : {}),
    };
    this.setBusy();
    this.api
      .create(body)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (d) => this.handleResult(d),
        error: (e) => this.handleError(e),
      });
  }

  deleteAll(): void {
    this.setBusy();
    this.api
      .deleteAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (d) => this.handleResult(d),
        error: (e) => this.handleError(e),
      });
  }
}
