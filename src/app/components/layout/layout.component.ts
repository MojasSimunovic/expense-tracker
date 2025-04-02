import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { QrButtonComponent } from "../qr-button/qr-button.component";

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, MatIconModule, MatButtonModule, RouterLink, RouterLinkActive, QrButtonComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  router = inject(Router);
  authService = inject(AuthService);
  logOut() {
    this.authService.logOut().then(() => {
      this.router.navigateByUrl('login');
    }).catch(err => console.error('Logout Error:', err));
  }
}
