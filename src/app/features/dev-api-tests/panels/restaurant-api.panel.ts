import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { RestaurantApiService } from '../../../core/api/restaurant-api.service';
import type { CreateRestaurantRequest } from '../../../core/api/api.models';
import { formatHttpError } from '../format-http-error';

@Component({
  standalone: true,
  selector: 'app-restaurant-api-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant-api.panel.html',
  styleUrl: './restaurant-api.panel.scss',
})
export class RestaurantApiPanel {
  private readonly api = inject(RestaurantApiService);

  readonly loading = signal(false);
  readonly responseText = signal('');

  queryId = '';
  queryCategory = '';

  createName = 'Test Bistro';
  createCity = 'São Paulo';
  createState = 'SP';
  createCountry = 'BR';
  createStreet = '';
  createZip = '';
  createCategories = 'Italian, Pizza';
  createInstagram = '';
  createImages = '';

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

  getCategories(): void {
    this.setBusy();
    this.api
      .findCategories()
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

  getByCategory(): void {
    const name = this.queryCategory.trim();
    if (!name) {
      this.responseText.set('Enter a category name.');
      return;
    }
    this.setBusy();
    this.api
      .findByCategory(name)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (d) => this.handleResult(d),
        error: (e) => this.handleError(e),
      });
  }

  create(): void {
    const name = this.createName.trim();
    if (!name) {
      this.responseText.set('Name is required.');
      return;
    }
    const city = this.createCity.trim();
    const state = this.createState.trim();
    const country = this.createCountry.trim();
    if (!city || !state || !country) {
      this.responseText.set('Address city, state, and country are required.');
      return;
    }
    const categories = this.createCategories
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((n) => ({ name: n }));
    if (!categories.length) {
      this.responseText.set('Add at least one category (comma-separated).');
      return;
    }
    const images = this.createImages
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const body: CreateRestaurantRequest = {
      name,
      address: {
        city,
        state,
        country,
        ...(this.createStreet.trim() ? { street: this.createStreet.trim() } : {}),
        ...(this.createZip.trim() ? { zipCode: this.createZip.trim() } : {}),
      },
      categories,
      ...(this.createInstagram.trim() ? { instagram: this.createInstagram.trim() } : {}),
      ...(images.length ? { images } : {}),
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
