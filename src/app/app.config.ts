import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { initializeApp } from 'firebase/app';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { bearerTokenInterceptor } from './core/auth/bearer-token-interceptor';
import { getFirebaseOptions } from './core/firebase/firebase-options';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([bearerTokenInterceptor])),
    provideFirebaseApp(() => initializeApp(getFirebaseOptions())),
    provideAuth(() => getAuth())
  ]
};
