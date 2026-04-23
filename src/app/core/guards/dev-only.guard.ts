import { inject, isDevMode } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const devOnlyGuard: CanActivateFn = () => {
  if (isDevMode()) {
    return true;
  }
  return inject(Router).createUrlTree(['/home']);
};
