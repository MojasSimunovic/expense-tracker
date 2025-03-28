import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'expense-tracker-8eb06',
        appId: '1:309305696698:web:3bf2dc0653549aa9bffd83',
        storageBucket: 'expense-tracker-8eb06.firebasestorage.app',
        apiKey: 'AIzaSyBmk1Swlxlrp-CSx_3iGtFcga4XHvEJTQo',
        authDomain: 'expense-tracker-8eb06.firebaseapp.com',
        messagingSenderId: '309305696698',
        measurementId: 'G-BMJ5HF4D39',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideHttpClient(),
  ],
};
