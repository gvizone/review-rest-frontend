import { HttpErrorResponse } from '@angular/common/http';

/** Turns API / network errors into a short user-facing string. */
export function httpErrorUserMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (typeof err.error === 'object' && err.error && 'message' in err.error) {
      const msg = (err.error as { message?: unknown }).message;
      if (typeof msg === 'string') return msg;
      if (Array.isArray(msg)) return msg.join(', ');
    }
    return err.message || `Request failed (${err.status})`;
  }
  return 'Something went wrong. Please try again.';
}

/** Pretty-printed payload for dev / API harness (not for end users). */
export function httpErrorDebugText(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    return JSON.stringify(
      {
        status: err.status,
        statusText: err.statusText,
        error: err.error,
      },
      null,
      2,
    );
  }
  return err instanceof Error ? err.message : String(err);
}
