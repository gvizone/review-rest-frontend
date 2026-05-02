import { HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export function jsonResponse<T>(body: T, status = 200): Observable<HttpEvent<unknown>> {
  return of(new HttpResponse({ status, body }));
}

export function notFoundResponse(): Observable<HttpEvent<unknown>> {
  return of(new HttpResponse({ status: 404, statusText: 'Not Found', body: null }));
}
