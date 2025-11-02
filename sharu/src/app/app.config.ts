
// sharu/src/app/app.config.ts

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // ⬅️ IMPORT
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { authInterceptor } from './auth/auth.interceptor';
//import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // ⬇️ THIS IS THE CRITICAL FIX ⬇️
    provideHttpClient(
      // Ensure the interceptor is included when providing HttpClient
      withInterceptors([authInterceptor])
    ),

    // Provide service worker support
    provideServiceWorker('ngsw-worker.js', {
      // enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};