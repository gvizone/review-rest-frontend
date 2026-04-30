import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { inject } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { UserApiService } from '../api/user-api.service';

export const userExistsGuard: CanActivateFn = (): ReturnType<CanActivateFn> => {
  const userApi = inject(UserApiService);
  const auth = inject(AuthService);
  const router = inject(Router);

  const authEmail = auth.userProfile()?.email;

  if (!authEmail) return router.createUrlTree(['/login']);

  return userApi.findByEmail(authEmail).pipe(
    take(1),
    map((user): boolean | UrlTree => {
      if (user) return true;
      return router.createUrlTree(['/register']);
    }),
  );
};
