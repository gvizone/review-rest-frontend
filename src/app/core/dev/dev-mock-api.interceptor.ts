import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { isDevMode } from '@angular/core';
import { Observable, of } from 'rxjs';
import type {
  CreateRestaurantRequest,
  CreateReviewRequest,
  CreateUserRequest,
} from '../api/api.models';
import { environment } from '../../../environments/environment';
import { DevHarnessService } from './dev-harness.service';
import * as mock from './dev-mock-api.state';

function apiSuffix(url: string): string | null {
  const base = environment.apiUrl.replace(/\/$/, '');
  if (!url.startsWith(base)) return null;
  let path = url.slice(base.length);
  path = path.split('?')[0];
  if (!path || path === '') path = '/';
  if (!path.startsWith('/')) path = `/${path}`;
  const normalized = path.replace(/\/$/, '') || '/';
  return normalized;
}

function json<T>(body: T, status = 200): Observable<HttpEvent<unknown>> {
  return of(new HttpResponse({ status, body }));
}

function notFound(): Observable<HttpEvent<unknown>> {
  return of(new HttpResponse({ status: 404, statusText: 'Not Found', body: null }));
}

function handleUsers(
  req: HttpRequest<unknown>,
  parts: string[],
): Observable<HttpEvent<unknown>> | null {
  if (parts[0] !== 'users') return null;

  if (req.method === 'GET' && parts.length === 1) {
    return json(mock.devMockListUsers());
  }

  if (req.method === 'GET' && parts.length >= 3 && parts[1] === 'email') {
    const email = decodeURIComponent(parts.slice(2).join('/'));
    const user = mock.devMockFindUserByEmail(email);
    
    return json(user ?? null);
  }

  if (req.method === 'GET' && parts.length === 3 && parts[1] === 'id') {
    const user = mock.devMockFindUserById(parts[2]);
    return user ? json(user) : notFound();
  }

  if (req.method === 'GET' && parts.length === 2 && parts[1] !== 'email' && parts[1] !== 'id') {
    const user = mock.devMockFindUserById(parts[1]);
    return user ? json(user) : notFound();
  }

  if (req.method === 'POST' && parts.length === 1) {
    const body = req.body as CreateUserRequest;
    const created = mock.devMockCreateUser(body);
    return json(created, 201);
  }

  return null;
}

function handleRestaurants(
  req: HttpRequest<unknown>,
  parts: string[],
): Observable<HttpEvent<unknown>> | null {
  if (parts[0] !== 'restaurants') return null;

  if (req.method === 'GET' && parts.length === 1) {
    return json(mock.devMockListRestaurants());
  }

  if (req.method === 'GET' && parts.length === 2 && parts[1] === 'categories') {
    return json(mock.devMockRestaurantCategories());
  }

  if (req.method === 'GET' && parts.length === 3 && parts[1] === 'category') {
    const name = decodeURIComponent(parts[2]);
    return json(mock.devMockRestaurantsByCategory(name));
  }

  if (req.method === 'GET' && parts.length === 2) {
    const r = mock.devMockFindRestaurantById(parts[1]);
    return r ? json(r) : notFound();
  }

  if (req.method === 'POST' && parts.length === 1) {
    const body = req.body as CreateRestaurantRequest;
    const created = mock.devMockCreateRestaurant(body);
    return json(created, 201);
  }

  return null;
}

function handleReviews(
  req: HttpRequest<unknown>,
  parts: string[],
): Observable<HttpEvent<unknown>> | null {
  if (parts[0] !== 'reviews') return null;

  if (req.method === 'GET' && parts.length === 1) {
    return json(mock.devMockListReviews());
  }

  if (req.method === 'GET' && parts.length === 2) {
    const r = mock.devMockFindReviewById(parts[1]);
    return r ? json(r) : notFound();
  }

  if (req.method === 'POST' && parts.length === 1) {
    const body = req.body as CreateReviewRequest;
    const created = mock.devMockCreateReview(body);
    return json(created, 201);
  }

  return null;
}

function handleDevMockApiRequest(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
  const suffix = apiSuffix(req.url);
  if (suffix === null) return notFound();
  const parts = suffix.split('/').filter(Boolean);
  if (!parts.length) return notFound();

  const root = parts[0];
  if (root === 'users') return handleUsers(req, parts) ?? notFound();
  if (root === 'restaurants') return handleRestaurants(req, parts) ?? notFound();
  if (root === 'reviews') return handleReviews(req, parts) ?? notFound();
  return notFound();
}

export const devMockApiInterceptor: HttpInterceptorFn = (
  req,
  next,
): Observable<HttpEvent<unknown>> => {
  if (!isDevMode()) return next(req);
  const dev = inject(DevHarnessService);
  if (!dev.mockEnabled()) return next(req);
  if (apiSuffix(req.url) === null) return next(req);
  return handleDevMockApiRequest(req);
};
