import { Injectable, isDevMode, signal } from '@angular/core';
import {
  ensureDevMockUserFromAuth,
  resetDevMockApiState,
} from '../../core/dev/mock-api/dev-mock-api.state';

const STORAGE_MOCK = 'rr-dev-mock';

/**
 * Single dev flag: mock Firebase auth + mock HTTP API together.
 * Only meaningful when `isDevMode()` is true.
 */
@Injectable({ providedIn: 'root' })
export class DevHarnessService {
  private readonly dev = isDevMode();

  private readonly _mockEnabled = signal(this.readInitialMockEnabled());

  readonly mockEnabled = this._mockEnabled.asReadonly();

  constructor() {
    if (this.dev && this._mockEnabled()) {
      ensureDevMockUserFromAuth();
    }
  }

  /**
   * Turn mock mode on or off. Enabling resets in-memory API mocks and re-seeds the dev user.
   * Persisted under `rr-dev-mock` when in development.
   */
  setMock(enabled: boolean): void {
    if (!this.dev) return;
    this._mockEnabled.set(enabled);
    localStorage.setItem(STORAGE_MOCK, enabled ? '1' : '0');
    if (enabled) {
      resetDevMockApiState();
      ensureDevMockUserFromAuth();
    }
  }

  private readInitialMockEnabled(): boolean {
    if (!this.dev) return false;
    return localStorage.getItem(STORAGE_MOCK) === '1';
  }
}
