import { inject, Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, user, authState, User } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import {  from, Observable, Subject, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  user$: Observable<User | null>;
  router = inject(Router);

  constructor(private auth: Auth, private afAuth: AngularFireAuth) {
    this.user$ = authState(this.auth);
  }

  signUp(email: string, password: string) {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  signIn(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  signInWithGoogle() {
    return this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }
  // logOut() {
  //   this.router.navigateByUrl('login');
  //   return this.afAuth.signOut();
  // }
  logOut() {
     return signOut(this.auth).then(() => {
      this.router.navigate(['login']);
    });
  }
  getCurrentUser() {
    return user(this.auth);
   
  }
  getAuthState() {
    return authState(this.auth);
  }
}