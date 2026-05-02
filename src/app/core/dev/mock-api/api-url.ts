import { environment } from '../../../../environments/environment';

/** Returns normalized API path after `apiUrl`, or null if `url` is not under the API base. */
export function devMockApiPathSuffix(url: string): string | null {
  const base = environment.apiUrl.replace(/\/$/, '');
  if (!url.startsWith(base)) return null;
  let path = url.slice(base.length);
  path = path.split('?')[0];
  if (!path || path === '') path = '/';
  if (!path.startsWith('/')) path = `/${path}`;
  const normalized = path.replace(/\/$/, '') || '/';
  return normalized;
}
