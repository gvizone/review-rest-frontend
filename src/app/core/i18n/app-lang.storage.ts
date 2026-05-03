/** localStorage key for persisted UI language (ISO 639-1 codes used in Transloco). */
export const APP_LANG_STORAGE_KEY = 'review-restaurant.lang';

export type AppLang = 'pt' | 'en';

export const APP_LANGS: readonly AppLang[] = ['pt', 'en'] as const;

export function isAppLang(value: string | null): value is AppLang {
  return value === 'pt' || value === 'en';
}

export function readStoredAppLang(): AppLang | null {
  try {
    const raw = localStorage.getItem(APP_LANG_STORAGE_KEY);
    return isAppLang(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function writeStoredAppLang(lang: AppLang): void {
  try {
    localStorage.setItem(APP_LANG_STORAGE_KEY, lang);
  } catch {
    /* ignore quota / private mode */
  }
}

/** Keep `<html lang>` aligned with Transloco for assistive tech (BCP 47). */
export function applyDocumentLang(lang: AppLang): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
}
