import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { inject } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { UserApiService } from '../../services/api/user-api.service';
import { LoginModalService } from '../../services/ui/login-modal.service';
import { RegisterModalService } from '../../services/ui/register-modal.service';

export const userExistsGuard: CanActivateFn = (): ReturnType<CanActivateFn> => {
  const userApi = inject(UserApiService);
  const auth = inject(AuthService);
  const router = inject(Router);
  const loginModal = inject(LoginModalService);
  const registerModal = inject(RegisterModalService);

  const authEmail = auth.userProfile()?.email;

  if (!authEmail) {
    loginModal.open();
    return router.createUrlTree(['/home']);
  }

  return userApi.findByEmail(authEmail).pipe(
    take(1),
    map((user): boolean | UrlTree => {
      if (user) return true;
      registerModal.open();
      return router.createUrlTree(['/home']);
    }),
  );
};
