import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  user,
  authState,
  User,
} from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  doc,
  Firestore,
  getDoc,
  onSnapshot,
  setDoc,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { from, Observable, Subject, throwError } from 'rxjs';

// Define ThemeMode type
export type ThemeMode = 'light' | 'dark' | 'system';

// Optionally, define UserPreferences interface if not already present
export interface UserPreferences {
  themeMode: ThemeMode;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null>;
  router = inject(Router);
  private themeMode = signal<ThemeMode>('system');
  private systemDarkMode = signal(false);

  // Computed signal for the actual theme to apply
  public readonly isDarkMode = computed(() => {
    const mode = this.themeMode();
    if (mode === 'system') {
      return this.systemDarkMode();
    }
    return mode === 'dark';
  });

  private firestore = inject(Firestore);

  public readonly currentThemeMode = this.themeMode.asReadonly();

  constructor(private auth: Auth, private afAuth: AngularFireAuth) {
    this.user$ = authState(this.auth);
    this.initializeSystemThemeDetection();
    this.initializeUserPreferences();
    document.body.setAttribute('data-theme', this.themeMode());
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
  private initializeSystemThemeDetection() {
    // Detect initial system theme
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemDarkMode.set(darkModeQuery.matches);

    // Listen for system theme changes
    darkModeQuery.addEventListener('change', (e) => {
      this.systemDarkMode.set(e.matches);
    });
  }

  private initializeUserPreferences() {
    // Load from localStorage first for immediate UI update
    const savedTheme = localStorage.getItem('themeMode') as ThemeMode;
    if (savedTheme) {
      this.themeMode.set(savedTheme);
    }

    // Listen to auth state changes
    user(this.auth)
      .pipe(takeUntilDestroyed())
      .subscribe(async (firebaseUser) => {
        if (firebaseUser) {
          await this.loadUserPreferences(firebaseUser.uid);
          this.startPreferencesSync(firebaseUser.uid);
        } else {
          // User logged out - keep local preference
          this.stopPreferencesSync();
        }
      });
  }

  private unsubscribePreferences?: () => void;

  private async loadUserPreferences(userId: string) {
    try {
      const prefsDoc = await getDoc(
        doc(this.firestore, 'userPreferences', userId)
      );

      if (prefsDoc.exists()) {
        const prefs = prefsDoc.data() as UserPreferences;
        this.themeMode.set(prefs.themeMode);
        // Save to localStorage for offline access
        localStorage.setItem('themeMode', prefs.themeMode);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  }

  private startPreferencesSync(userId: string) {
    // Real-time sync of preferences across tabs/devices
    this.unsubscribePreferences = onSnapshot(
      doc(this.firestore, 'userPreferences', userId),
      (doc) => {
        if (doc.exists()) {
          const prefs = doc.data() as UserPreferences;
          this.themeMode.set(prefs.themeMode);
          localStorage.setItem('themeMode', prefs.themeMode);
        }
      },
      (error) => {
        console.error('Error syncing preferences:', error);
      }
    );
  }

  private stopPreferencesSync() {
    if (this.unsubscribePreferences) {
      this.unsubscribePreferences();
      this.unsubscribePreferences = undefined;
    }
  }

  public async setThemeMode(mode: ThemeMode) {
    this.themeMode.set(mode);
    document.body.setAttribute('data-theme', mode);
    localStorage.setItem('themeMode', mode);

    const currentUser = this.auth.currentUser;
    if (currentUser) {
      try {
        await setDoc(
          doc(this.firestore, 'userPreferences', currentUser.uid),
          {
            themeMode: mode,
          },
          { merge: true }
        );
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    }
  }

  public toggleTheme() {
    const currentMode = this.themeMode();
    const newMode: ThemeMode = currentMode === 'dark' ? 'light' : 'dark';
    this.setThemeMode(newMode);
  }
}
