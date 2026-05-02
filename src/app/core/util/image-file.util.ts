/** Per-file size limit for uploads (base64 in API grows ~4/3 of this). */
export const MAX_IMAGE_FILE_BYTES = 3 * 1024 * 1024;

export const MAX_GALLERY_IMAGE_FILES = 8;

export function readFileAsDataUrl(
  file: File,
  maxBytes: number = MAX_IMAGE_FILE_BYTES,
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return Promise.reject(new Error('Please choose an image file.'));
  }
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return Promise.reject(new Error(`Each image must be ${mb} MB or smaller.`));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Could not read file.'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read file.'));
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
