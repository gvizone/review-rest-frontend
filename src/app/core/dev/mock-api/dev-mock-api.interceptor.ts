import { HttpEvent, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, isDevMode } from '@angular/core';
import { Observable } from 'rxjs';
import { DevHarnessService } from '../../../services/dev/dev-harness.service';
import { devMockApiPathSuffix } from './api-url';
import { handleDevMockProfile } from './handlers/profile.handler';
import { handleDevMockRestaurants } from './handlers/restaurants.handler';
import { handleDevMockReviews } from './handlers/reviews.handler';
import { handleDevMockUsers } from './handlers/users.handler';
import { notFoundResponse } from './http-shims';

function handleDevMockApiRequest(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
  const suffix = devMockApiPathSuffix(req.url);
  if (suffix === null) return notFoundResponse();
  const parts = suffix.split('/').filter(Boolean);
  if (!parts.length) return notFoundResponse();

  const root = parts[0];
  if (root === 'profile') return handleDevMockProfile(req, parts) ?? notFoundResponse();
  if (root === 'users') return handleDevMockUsers(req, parts) ?? notFoundResponse();
  if (root === 'restaurants') return handleDevMockRestaurants(req, parts) ?? notFoundResponse();
  if (root === 'reviews') return handleDevMockReviews(req, parts) ?? notFoundResponse();
  return notFoundResponse();
}

export const devMockApiInterceptor: HttpInterceptorFn = (
  req,
  next,
): Observable<HttpEvent<unknown>> => {
  if (!isDevMode()) return next(req);
  const dev = inject(DevHarnessService);
  if (!dev.mockEnabled()) return next(req);
  if (devMockApiPathSuffix(req.url) === null) return next(req);
  return handleDevMockApiRequest(req);
};
