import { APP_INITIALIZER, EnvironmentProviders, Provider } from '@angular/core';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { TranslocoHttpLoader } from './transloco-http.loader';
import { APP_LANGS, applyDocumentLang, isAppLang, readStoredAppLang } from './app-lang.storage';

function initAppLanguage(transloco: TranslocoService): () => void {
  return () => {
    const stored = readStoredAppLang();
    if (stored) {
      transloco.setActiveLang(stored);
    }
    const active = transloco.getActiveLang();
    applyDocumentLang(isAppLang(active) ? active : 'pt');
  };
}

/**
 * Runtime i18n: JSON in `src/assets/i18n/{lang}.json`, default `pt`, fallback `en`.
 */
export function provideAppI18n(): (EnvironmentProviders | Provider)[] {
  return [
    provideTransloco({
      config: {
        availableLangs: [...APP_LANGS],
        defaultLang: 'pt',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
      },
      loader: TranslocoHttpLoader,
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: initAppLanguage,
      deps: [TranslocoService],
      multi: true,
    },
  ];
}
