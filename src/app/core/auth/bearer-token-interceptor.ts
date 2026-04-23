import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { getIdToken } from 'firebase/auth';
import { from, lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

async function addBearerToken(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Promise<HttpEvent<unknown>> {
  const auth = inject(Auth);
  const user = auth.currentUser;
  const token = user ? await getIdToken(user) : null;
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return lastValueFrom(next(req));
}

export const bearerTokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(environment.apiUrl)) {
    return from(addBearerToken(req, next));
  }
  return next(req);
};
