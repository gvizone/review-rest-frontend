import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { initializeApp } from 'firebase/app';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { bearerTokenInterceptor } from './services/http/bearer-token.interceptor';
import { devMockApiInterceptor } from './core/dev/mock-api/dev-mock-api.interceptor';
import { getFirebaseOptions } from './core/firebase/firebase-options';
import { provideAppI18n } from './core/i18n/provide-app-i18n';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([devMockApiInterceptor, bearerTokenInterceptor])),
    ...provideAppI18n(),
    provideFirebaseApp(() => initializeApp(getFirebaseOptions())),
    provideAuth(() => getAuth()),
  ],
};
