import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Registration is mandatory after sign-in when this modal opens. Closing without a
 * successful API registration signs the user out.
 */
@Injectable({ providedIn: 'root' })
export class RegisterModalService {
  private readonly auth = inject(AuthService);
  private readonly _isOpen = signal(false);

  readonly isOpen = this._isOpen.asReadonly();

  open(): void {
    this._isOpen.set(true);
  }

  /** Cancel / dismiss: closes the modal and signs out (user did not complete registration). */
  close(): void {
    if (!this._isOpen()) return;
    this._isOpen.set(false);
    void this.auth.signOut();
  }

  /** After `POST /users` succeeds — close without signing out. */
  closeAfterSuccessfulRegistration(): void {
    if (!this._isOpen()) return;
    this._isOpen.set(false);
  }
}