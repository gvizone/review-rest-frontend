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
  styleUrl: './review-api.panel.scss'
})
export class ReviewApiPanel {
  private readonly api = inject(ReviewApiService);

  readonly loading = signal(false);
  readonly responseText = signal('');

  queryId = '';

  uName = 'Reviewer';
  uEmail = 'reviewer@example.com';
  uStreet = '';
  uCity = 'São Paulo';
  uState = 'SP';
  uCountry = 'BR';
  uZip = '';

  rName = 'Sample Place';
  rCategories = 'Cafe';
  rStreet = '';
  rCity = 'São Paulo';
  rState = 'SP';
  rCountry = 'BR';
  rZip = '';
  rInstagram = '';
  rImages = '';

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
        error: (e) => this.handleError(e)
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
        error: (e) => this.handleError(e)
      });
  }

  create(): void {
    const uName = this.uName.trim();
    const uEmail = this.uEmail.trim();
    const uCity = this.uCity.trim();
    const uState = this.uState.trim();
    const uCountry = this.uCountry.trim();
    const rName = this.rName.trim();
    const rCity = this.rCity.trim();
    const rState = this.rState.trim();
    const rCountry = this.rCountry.trim();
    if (!uName || !uEmail || !uCity || !uState || !uCountry) {
      this.responseText.set('User name, email, city, state, and country are required.');
      return;
    }
    if (!rName || !rCity || !rState || !rCountry) {
      this.responseText.set('Restaurant name, city, state, and country are required.');
      return;
    }
    const categories = this.rCategories
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((n) => ({ name: n }));
    if (!categories.length) {
      this.responseText.set('Add at least one restaurant category (comma-separated).');
      return;
    }
    const rImgs = this.rImages
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const revImgs = this.images
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const body: CreateReviewRequest = {
      user: {
        name: uName,
        email: uEmail,
        address: {
          city: uCity,
          state: uState,
          country: uCountry,
          ...(this.uStreet.trim() ? { street: this.uStreet.trim() } : {}),
          ...(this.uZip.trim() ? { zipCode: this.uZip.trim() } : {})
        }
      },
      restaurant: {
        name: rName,
        address: {
          city: rCity,
          state: rState,
          country: rCountry,
          ...(this.rStreet.trim() ? { street: this.rStreet.trim() } : {}),
          ...(this.rZip.trim() ? { zipCode: this.rZip.trim() } : {})
        },
        categories,
        ...(this.rInstagram.trim() ? { instagram: this.rInstagram.trim() } : {}),
        ...(rImgs.length ? { images: rImgs } : {})
      },
      note: {
        service: clampNote(this.nService),
        food: clampNote(this.nFood),
        value: clampNote(this.nValue),
        atmosphere: clampNote(this.nAtmosphere)
      },
      images: revImgs,
      ...(this.commentary.trim() ? { commentary: this.commentary.trim() } : {})
    };
    this.setBusy();
    this.api
      .create(body)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (d) => this.handleResult(d),
        error: (e) => this.handleError(e)
      });
  }
}
