import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './services/auth.service';
import { User } from '@firebase/auth';
import { Observable, Subject } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    NgClass,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  router = inject(Router);
  authService = inject(AuthService);
  userSignal = toSignal(this.authService.user$);
  error: null;
  public readonly isDarkMode = this.authService.isDarkMode;
  public readonly currentThemeMode = this.authService.currentThemeMode;

  constructor() {
    this.error = null;
  }

  closeNavbar() {
    const navbarCollapse = document.getElementById('navbarNav') as HTMLElement;
    if (navbarCollapse) {
      if (navbarCollapse.classList.contains('show')) {
        navbarCollapse.classList.add('collapsing');
        navbarCollapse.classList.remove('show');
        setTimeout(() => {
          navbarCollapse.classList.remove('collapsing');
        }, 600);
      }
    }
  }

  toggleTheme() {
    this.authService.toggleTheme();
  }

  logOut() {
    this.authService
      .logOut()
      .then(() => {})
      .catch((err) => console.error('Logout Error:', err));
  }
  async onLogout() {
    this.error = null;
    this.router.navigate(['login']);
    try {
      await this.authService.logOut();
    } catch (err: any) {
      this.error = err.message;
    }
  }
}
