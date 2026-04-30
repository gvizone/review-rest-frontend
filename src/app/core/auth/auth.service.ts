import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, GoogleAuthProvider, User, signInWithPopup, signOut } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { authState } from '@angular/fire/auth';

export type AuthProviderId = 'google.com';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);

  readonly user$: Observable<User | null> = authState(this.auth);

  readonly userProfile$: Observable<User | null> = this.user$;

  readonly userProfile = toSignal(this.userProfile$, {
    initialValue: null as User | null,
  });

  async signInWithProvider(providerId: AuthProviderId): Promise<void> {
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
