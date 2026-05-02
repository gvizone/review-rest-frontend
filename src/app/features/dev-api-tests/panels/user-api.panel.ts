import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { UserApiService } from '../../../core/api/user-api.service';
import type { CreateUserRequest } from '../../../core/api/api.models';
import { formatHttpError } from '../format-http-error';

@Component({
  standalone: true,
  selector: 'app-user-api-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-api.panel.html',
  styleUrl: './user-api.panel.scss',
})
export class UserApiPanel {
  private readonly api = inject(UserApiService);

  readonly loading = signal(false);
  readonly responseText = signal('');

  queryId = '';

  createName = 'Dev User';
  createEmail = 'dev@example.com';
  createCity = 'São Paulo';
  createState = 'SP';
  createCountry = 'BR';
  createStreet = '';
  createZip = '';

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
    const name = this.createName.trim();
    const email = this.createEmail.trim();
    const city = this.createCity.trim();
    const state = this.createState.trim();
    const country = this.createCountry.trim();
    if (!name || !email || !city || !state || !country) {
      this.responseText.set('Name, email, city, state, and country are required.');
      return;
    }
    const body: CreateUserRequest = {
      name,
      email,
      address: {
        city,
        state,
        country,
        ...(this.createStreet.trim() ? { street: this.createStreet.trim() } : {}),
        ...(this.createZip.trim() ? { zipCode: this.createZip.trim() } : {}),
      },
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
