import { inject } from '@angular/core';
import { onAuthStateChanged } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AngularFireAuth);
  const router = inject(Router);

  const user = await firstValueFrom(auth.authState);

  if (user) {
    return true;
  } else {
    router.navigateByUrl('login');
    return false;
  }
};

export const authGuardLoggedIn: CanActivateFn = async (route, state) => {
  const auth = inject(AngularFireAuth);
  const router = inject(Router);
  const user = await firstValueFrom(auth.authState);

  if (user) {
    router.navigateByUrl('dashboard'); 
    return false;
  } else {
    return true;
  }
};