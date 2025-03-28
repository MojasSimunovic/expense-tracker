import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, MatIconModule, MatButtonModule, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  router = inject(Router);
  logOut() {
    localStorage.removeItem('loggedUser');
    this.router.navigateByUrl('login');
  }
}
