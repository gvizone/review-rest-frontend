import { HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { CreateReviewRequest } from '../../../../domain/models';
import * as mock from '../dev-mock-api.state';
import { jsonResponse, notFoundResponse } from '../http-shims';

export function handleDevMockReviews(
  req: HttpRequest<unknown>,
  parts: string[],
): Observable<HttpEvent<unknown>> | null {
  if (parts[0] !== 'reviews') return null;

  if (req.method === 'GET' && parts.length === 1) {
    return jsonResponse(mock.devMockListReviews());
  }

  if (req.method === 'GET' && parts.length === 2) {
    const r = mock.devMockFindReviewById(parts[1]);
    return r ? jsonResponse(r) : notFoundResponse();
  }

  if (req.method === 'POST' && parts.length === 1) {
    const body = req.body as CreateReviewRequest;
    if (!body?.userId?.trim() || !body?.restaurantId?.trim()) {
      return jsonResponse(
        { statusCode: 400, message: 'userId and restaurantId are required' },
        400,
      );
    }
    if (!mock.devMockFindUserById(body.userId.trim())) {
      return jsonResponse({ statusCode: 404, message: `User ${body.userId} not found` }, 404);
    }
    if (!mock.devMockFindRestaurantById(body.restaurantId.trim())) {
      return jsonResponse(
        { statusCode: 404, message: `Restaurant ${body.restaurantId} not found` },
        404,
      );
    }
    try {
      const created = mock.devMockCreateReview({
        ...body,
        userId: body.userId.trim(),
        restaurantId: body.restaurantId.trim(),
      });
      return jsonResponse(created, 201);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Create review failed';
      return jsonResponse({ statusCode: 500, message }, 500);
    }
  }

  return null;
}
