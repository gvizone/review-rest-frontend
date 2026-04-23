import { HttpErrorResponse } from '@angular/common/http';

export function formatHttpError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    return JSON.stringify(
      {
        status: err.status,
        statusText: err.statusText,
        error: err.error
      },
      null,
      2
    );
  }
  return err instanceof Error ? err.message : String(err);
}
