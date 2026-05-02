import { HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DEV_MOCK_AUTH_EMAIL } from '../../dev-mock-firebase-user';
import * as mock from '../dev-mock-api.state';
import { jsonResponse, notFoundResponse } from '../http-shims';

export function handleDevMockProfile(
  req: HttpRequest<unknown>,
  parts: string[],
): Observable<HttpEvent<unknown>> | null {
  if (parts[0] !== 'profile' || parts[1] !== 'me') return null;

  const mockUser = mock.devMockFindUserByEmail(DEV_MOCK_AUTH_EMAIL);
  if (!mockUser) {
    return jsonResponse(
      { statusCode: 404, message: 'No profile found for this account.' },
      404,
    );
  }

  if (req.method === 'GET' && parts.length === 2) {
    const snapshot = mock.devMockGetUserProfile(mockUser.id);
    return snapshot ? jsonResponse(snapshot) : notFoundResponse();
  }

  if (req.method === 'PATCH' && parts.length === 3 && parts[2] === 'image') {
    const body = req.body as { image?: string };
    const updated = mock.devMockPatchUserImage(mockUser.id, body.image);
    return updated ? jsonResponse(updated) : notFoundResponse();
  }

  return null;
}
