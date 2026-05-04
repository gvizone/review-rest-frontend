/** Per-file size limit for uploads (base64 in API grows ~4/3 of this). */
export const MAX_IMAGE_FILE_BYTES = 3 * 1024 * 1024;

export const MAX_GALLERY_IMAGE_FILES = 8;

/** Thrown when image validation fails; map to Transloco keys under `errors.image.*`. */
export class ImageValidationError extends Error {
  override readonly name = 'ImageValidationError';

  constructor(
    readonly translocoKey: string,
    readonly translocoParams?: Record<string, unknown>,
  ) {
    super(translocoKey);
  }
}

/** Plain message for dev tools or non-i18n contexts (Transloco key path or generic text). */
export function imagePickFailureMessage(err: unknown): string {
  if (err instanceof ImageValidationError) {
    return err.translocoKey;
  }
  return err instanceof Error ? err.message : 'Invalid image';
}

export function readFileAsDataUrl(
  file: File,
  maxBytes: number = MAX_IMAGE_FILE_BYTES,
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return Promise.reject(new ImageValidationError('errors.image.notAnImage'));
  }
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return Promise.reject(new ImageValidationError('errors.image.tooLarge', { mb }));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new ImageValidationError('errors.image.readFailed'));
      }
    };
    reader.onerror = () => reject(new ImageValidationError('errors.image.readFailed'));
    reader.readAsDataURL(file);
  });
}

export async function readFilesAsDataUrls(
  files: FileList | null,
  options?: { maxFiles?: number; maxBytesPerFile?: number },
): Promise<string[]> {
  if (!files?.length) {
    return [];
  }
  const maxFiles = options?.maxFiles ?? MAX_GALLERY_IMAGE_FILES;
  const maxBytes = options?.maxBytesPerFile ?? MAX_IMAGE_FILE_BYTES;
  const slice = Array.from(files).slice(0, maxFiles);
  return Promise.all(slice.map((f) => readFileAsDataUrl(f, maxBytes)));
}
