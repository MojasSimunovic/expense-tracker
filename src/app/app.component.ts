import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './services/auth.service';
import { User } from '@firebase/auth';
import { Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  router = inject(Router);
  authService = inject(AuthService);
  userSignal = toSignal(this.authService.user$);

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

  logOut() {
    this.authService.logOut().then(() => {
      this.router.navigateByUrl('login');
    }).catch(err => console.error('Logout Error:', err));
  }
}

