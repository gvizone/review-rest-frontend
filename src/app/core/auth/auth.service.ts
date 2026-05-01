import { Injectable, inject, isDevMode } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, GoogleAuthProvider, User, signInWithPopup, signOut } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { authState } from '@angular/fire/auth';
import { shareReplay, switchMap } from 'rxjs/operators';
import { DevHarnessService } from '../dev/dev-harness.service';
import { DEV_MOCK_FIREBASE_USER } from '../dev/dev-mock-firebase-user';

export type AuthProviderId = 'google.com';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly devHarness = inject(DevHarnessService);

  private readonly firebaseUser$ = authState(this.auth).pipe(
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly user$: Observable<User | null> = toObservable(this.devHarness.mockEnabled).pipe(
    switchMap(() =>
      isDevMode() && this.devHarness.mockEnabled()
        ? of(DEV_MOCK_FIREBASE_USER)
        : this.firebaseUser$,
    ),
  );

  readonly userProfile$: Observable<User | null> = this.user$;

  readonly userProfile = toSignal(this.userProfile$, {
    initialValue: null as User | null,
  });

  async signInWithProvider(providerId: AuthProviderId): Promise<void> {
    if (isDevMode() && this.devHarness.mockEnabled()) {
      return;
    }
    const provider = this.createProvider(providerId);
    await signInWithPopup(this.auth, provider);
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
  }

  private createProvider(providerId: AuthProviderId) {
    switch (providerId) {
      case 'google.com':
        return new GoogleAuthProvider();
      default: {
        const exhaustiveCheck: never = providerId;
        return exhaustiveCheck;
      }
    }
  }
}
