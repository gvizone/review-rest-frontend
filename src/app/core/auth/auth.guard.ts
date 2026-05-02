import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { LoginModalService } from './login-modal.service';

export const authGuard: CanActivateFn = (): ReturnType<CanActivateFn> => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const loginModal = inject(LoginModalService);

  return auth.user$.pipe(
    take(1),
    map((user): boolean | UrlTree => {
      if (user) return true;
      loginModal.open();
      return router.parseUrl('/home');
    }),
  );
};
