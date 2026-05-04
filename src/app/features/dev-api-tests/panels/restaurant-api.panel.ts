import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { RestaurantApiService } from '../../../services/api/restaurant-api.service';
import type { CreateRestaurantRequest, UpdateRestaurantRequest } from '../../../domain/models';
import { formatHttpError } from '../format-http-error';
import { readFilesAsDataUrls } from '../../../utils/image-file';

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
  createAbout = '';

  createImageDataUrls: string[] = [];

  editId = '';
  editName = '';
  editStreet = '';
  editCity = '';
  editState = '';
  editCountry = '';
  editZip = '';
  editAbout = '';
  editImageUrls: string[] = [];

  /** Raw JSON: either `[ {...}, ... ]` or `{ "items": [ ... ] }` (valid JSON only — no trailing commas). */
  bulkDumpJson = '';

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

  async onCreatePhotosChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    input.value = '';
    if (!files?.length) return;
    try {
      const urls = await readFilesAsDataUrls(files);
      this.createImageDataUrls = [...this.createImageDataUrls, ...urls];
      this.responseText.set('');
    } catch (e) {
      this.responseText.set(e instanceof Error ? e.message : 'Invalid image');
    }
  }

  clearCreatePhotos(): void {
    this.createImageDataUrls = [];
  }

  loadRestaurantForEdit(): void {
    const id = this.editId.trim();
    if (!id) {
      this.responseText.set('Enter a restaurant id to load.');
      return;
    }
    this.setBusy();
    this.api
      .findById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (r) => {
          this.editId = r.id;
          this.editName = r.name;
          this.editStreet = r.address.street ?? '';
          this.editCity = r.address.city;
          this.editState = r.address.state;
          this.editCountry = r.address.country;
          this.editZip = r.address.zipCode ?? '';
          this.editAbout = r.about ?? '';
          this.editImageUrls = r.images?.length ? [...r.images] : [];
          this.handleResult(r);
        },
        error: (e) => this.handleError(e),
      });
  }

  async onEditPhotosChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    input.value = '';
    if (!files?.length) return;
    try {
      const urls = await readFilesAsDataUrls(files);
      this.editImageUrls = [...this.editImageUrls, ...urls];
      this.responseText.set('');
    } catch (e) {
      this.responseText.set(e instanceof Error ? e.message : 'Invalid image');
    }
  }

  removeEditPhotoAt(index: number): void {
    this.editImageUrls = this.editImageUrls.filter((_, i) => i !== index);
  }

  saveRestaurantEdit(): void {
    const id = this.editId.trim();
    if (!id) {
      this.responseText.set('Enter a restaurant id (load first).');
      return;
    }
    const city = this.editCity.trim();
    const state = this.editState.trim();
    const country = this.editCountry.trim();
    if (!city || !state || !country) {
      this.responseText.set('Address city, state, and country are required.');
      return;
    }
    const body: UpdateRestaurantRequest = {
      address: {
        city,
        state,
        country,
        street: this.editStreet.trim(),
        zipCode: this.editZip.trim(),
      },
      about: this.editAbout,
      images: [...this.editImageUrls],
    };
    this.setBusy();
    this.api
      .update(id, body)
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
      ...(this.createImageDataUrls.length ? { images: [...this.createImageDataUrls] } : {}),
      ...(this.createAbout.trim() ? { about: this.createAbout.trim() } : {}),
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

  bulkImportFromJson(): void {
    const raw = this.bulkDumpJson.trim();
    if (!raw) {
      this.responseText.set('Paste a JSON array or { "items": [...] } first.');
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      this.responseText.set(
        'Invalid JSON. Fix syntax (e.g. remove trailing commas after the last property).',
      );
      return;
    }
    const items = this.normalizeBulkPayload(parsed);
    if (!items.length) {
      this.responseText.set(
        'No restaurant objects found. Use a non-empty array or { "items": [ ... ] }.',
      );
      return;
    }
    const err = this.validateBulkItems(items);
    if (err) {
      this.responseText.set(err);
      return;
    }
    this.setBusy();
    this.api
      .bulkCreate(items)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (d) => this.handleResult(d),
        error: (e) => this.handleError(e),
      });
  }

  private normalizeBulkPayload(parsed: unknown): (CreateRestaurantRequest & { id?: string })[] {
    if (Array.isArray(parsed)) {
      return parsed as (CreateRestaurantRequest & { id?: string })[];
    }
    if (parsed && typeof parsed === 'object' && 'items' in parsed) {
      const items = (parsed as { items: unknown }).items;
      if (Array.isArray(items)) {
        return items as (CreateRestaurantRequest & { id?: string })[];
      }
    }
    return [];
  }

  private validateBulkItems(items: (CreateRestaurantRequest & { id?: string })[]): string | null {
    for (let i = 0; i < items.length; i++) {
      const row = items[i] as unknown as Record<string, unknown>;
      if (!row || typeof row !== 'object') {
        return `Item ${i}: must be an object.`;
      }
      const name = row['name'];
      if (typeof name !== 'string' || !name.trim()) {
        return `Item ${i}: "name" is required (non-empty string).`;
      }
      const addr = row['address'];
      if (!addr || typeof addr !== 'object') {
        return `Item ${i}: "address" object is required.`;
      }
      const a = addr as Record<string, unknown>;
      for (const key of ['city', 'state', 'country'] as const) {
        if (typeof a[key] !== 'string' || !(a[key] as string).trim()) {
          return `Item ${i}: address.${key} is required (non-empty string).`;
        }
      }
      const cats = row['categories'];
      if (!Array.isArray(cats) || cats.length === 0) {
        return `Item ${i}: "categories" must be a non-empty array of { name: string }.`;
      }
      for (let j = 0; j < cats.length; j++) {
        const c = cats[j] as unknown as Record<string, unknown>;
        const catName = c['name'];
        if (!c || typeof catName !== 'string' || !catName.trim()) {
          return `Item ${i}, category ${j}: must have { "name": "..." }.`;
        }
      }
    }
    return null;
  }
}
