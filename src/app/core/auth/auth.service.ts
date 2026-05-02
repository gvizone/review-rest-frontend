import { effect, Injectable, inject, isDevMode } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, GoogleAuthProvider, User, signInWithPopup, signOut } from '@angular/fire/auth';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { authState } from '@angular/fire/auth';
import { map, shareReplay, switchMap, take } from 'rxjs/operators';
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

  /** When dev mock auth is on, `signOut()` sets this so `user$` emits null until the next mock sign-in. */
  private readonly mockSignedOut$ = new BehaviorSubject(false);

  readonly user$: Observable<User | null> = toObservable(this.devHarness.mockEnabled).pipe(
    switchMap(() =>
      isDevMode() && this.devHarness.mockEnabled()
        ? this.mockSignedOut$.pipe(
            map((signedOut) => (signedOut ? null : DEV_MOCK_FIREBASE_USER)),
          )
        : this.firebaseUser$,
    ),
  );

  constructor() {
    effect(() => {
      if (!isDevMode()) return;
      if (this.devHarness.mockEnabled()) {
        this.mockSignedOut$.next(false);
      }
    });
  }

  readonly userProfile$: Observable<User | null> = this.user$;

  readonly userProfile = toSignal(this.userProfile$, {
    initialValue: null as User | null,
  });

  /**
   * Returns the signed-in Firebase user. Use this after login instead of reading
   * `userProfile()` immediately — the signal can still be null until `authState` emits.
   */
  async signInWithProvider(providerId: AuthProviderId): Promise<User | null> {
    if (isDevMode() && this.devHarness.mockEnabled()) {
      this.mockSignedOut$.next(false);
      return firstValueFrom(this.user$.pipe(take(1)));
    }
    const provider = this.createProvider(providerId);
    const credential = await signInWithPopup(this.auth, provider);
    return credential.user;
  }

  async signOut(): Promise<void> {
    if (isDevMode() && this.devHarness.mockEnabled()) {
      this.mockSignedOut$.next(true);
      return;
    }
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
