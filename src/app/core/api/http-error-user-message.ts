import { HttpErrorResponse } from '@angular/common/http';

/** User-facing message from an HTTP or unknown error (forms, toasts, etc.). */
export function httpErrorUserMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (typeof err.error === 'object' && err.error && 'message' in err.error) {
      const msg = (err.error as { message?: unknown }).message;
      if (typeof msg === 'string') return msg;
      if (Array.isArray(msg)) return msg.join(', ');
    }
    return err.message || `Request failed (${err.status})`;
  }
  return 'Something went wrong.';
}
