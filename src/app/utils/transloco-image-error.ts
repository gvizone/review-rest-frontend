import type { TranslocoService } from '@jsverse/transloco';
import { ImageValidationError } from './image-file';

/** Maps image read/validation failures to a translated user message. */
export function translateImagePickFailure(
  transloco: TranslocoService,
  err: unknown,
  mode: 'single' | 'multi',
): string {
  if (err instanceof ImageValidationError) {
    return transloco.translate(err.translocoKey, err.translocoParams ?? {});
  }
  return transloco.translate(
    mode === 'multi' ? 'errors.couldNotReadImages' : 'errors.couldNotReadImage',
  );
}
