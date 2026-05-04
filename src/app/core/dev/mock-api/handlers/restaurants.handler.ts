import { HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { CreateRestaurantRequest, UpdateRestaurantRequest } from '../../../../domain/models';
import * as mock from '../dev-mock-api.state';
import { jsonResponse, notFoundResponse } from '../http-shims';

function queryStringFromRequestUrl(url: string): string {
  const idx = url.indexOf('?');
  return idx >= 0 ? url.slice(idx + 1) : '';
}

export function handleDevMockRestaurants(
  req: HttpRequest<unknown>,
  parts: string[],
): Observable<HttpEvent<unknown>> | null {
  if (parts[0] !== 'restaurants') return null;

  if (req.method === 'GET' && parts.length === 1) {
    return jsonResponse(mock.devMockListRestaurants());
  }

  if (req.method === 'GET' && parts.length === 2 && parts[1] === 'categories') {
    return jsonResponse(mock.devMockRestaurantCategories());
  }

  if (req.method === 'GET' && parts.length === 2 && parts[1] === 'search') {
    const sp = new URLSearchParams(queryStringFromRequestUrl(req.url));
    const q = sp.get('q') ?? '';
    const page = Math.max(1, parseInt(sp.get('page') ?? '1', 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(sp.get('limit') ?? '10', 10) || 10));
    return jsonResponse(mock.devMockSearchRestaurantsPaged(q, page, limit));
  }

  if (req.method === 'GET' && parts.length === 3 && parts[1] === 'category') {
    const name = decodeURIComponent(parts[2]);
    return jsonResponse(mock.devMockRestaurantsByCategory(name));
  }

  if (req.method === 'GET' && parts.length === 2) {
    const r = mock.devMockFindRestaurantById(parts[1]);
    return r ? jsonResponse(r) : notFoundResponse();
  }

  if (req.method === 'POST' && parts.length === 2 && parts[1] === 'bulk') {
    const body = req.body as { items?: mock.DevMockRestaurantCreateBody[] };
    if (!body?.items || !Array.isArray(body.items) || body.items.length === 0) {
      return jsonResponse(
        { message: 'Expected JSON body { "items": [ { ...restaurant }, ... ] } with at least one item.' },
        400,
      );
    }
    const created = mock.devMockBulkCreateRestaurants(body.items);
    return jsonResponse(created, 201);
  }

  if (req.method === 'POST' && parts.length === 1) {
    const body = req.body as CreateRestaurantRequest;
    const created = mock.devMockCreateRestaurant(body);
    return jsonResponse(created, 201);
  }

  if (req.method === 'PATCH' && parts.length === 2) {
    const id = parts[1];
    const body = req.body as UpdateRestaurantRequest;
    const updated = mock.devMockUpdateRestaurant(id, body);
    return updated ? jsonResponse(updated) : notFoundResponse();
  }

  return null;
}
