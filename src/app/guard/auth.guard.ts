import { inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AngularFireAuth);
  const router = inject(Router);
  const user = await auth.currentUser;
  
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
  const user = await auth.currentUser;

  if (user) {
    router.navigateByUrl('home');  // Redirect logged-in users to home
    return false;
  } else {
    return true;  // Allow navigation to login/signup
  }
};
