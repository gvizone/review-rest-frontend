import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject, isDevMode } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { getIdToken } from 'firebase/auth';
import { from, lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DevHarnessService } from '../dev/dev-harness.service';

async function addBearerToken(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Promise<HttpEvent<unknown>> {
  const auth = inject(Auth);
  const user = auth.currentUser;
  const token = user ? await getIdToken(user) : null;
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return lastValueFrom(next(req));
}

export const bearerTokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }
  if (isDevMode()) {
    const dev = inject(DevHarnessService);
    if (dev.mockEnabled()) {
      const withToken = req.clone({
        setHeaders: { Authorization: 'Bearer dev-mock-token' },
      });
      return next(withToken);
    }
  }
  return from(addBearerToken(req, next));
};
