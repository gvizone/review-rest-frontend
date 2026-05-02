import { HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { CreateUserRequest } from '../../../../domain/models';
import * as mock from '../dev-mock-api.state';
import { jsonResponse, notFoundResponse } from '../http-shims';

export function handleDevMockUsers(
  req: HttpRequest<unknown>,
  parts: string[],
): Observable<HttpEvent<unknown>> | null {
  if (parts[0] !== 'users') return null;

  if (req.method === 'GET' && parts.length === 1) {
    return jsonResponse(mock.devMockListUsers());
  }

  if (req.method === 'GET' && parts.length >= 3 && parts[1] === 'email') {
    const email = decodeURIComponent(parts.slice(2).join('/'));
    const user = mock.devMockFindUserByEmail(email);

    return jsonResponse(user ?? null);
  }

  if (req.method === 'GET' && parts.length === 3 && parts[1] === 'id') {
    const user = mock.devMockFindUserById(parts[2]);
    return user ? jsonResponse(user) : notFoundResponse();
  }

  if (req.method === 'GET' && parts.length === 2 && parts[1] !== 'email' && parts[1] !== 'id') {
    const user = mock.devMockFindUserById(parts[1]);
    return user ? jsonResponse(user) : notFoundResponse();
  }

  if (req.method === 'POST' && parts.length === 1) {
    const body = req.body as CreateUserRequest;
    const created = mock.devMockCreateUser(body);
    return jsonResponse(created, 201);
  }

  return null;
}
