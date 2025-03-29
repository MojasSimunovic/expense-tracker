import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormsModule, FormSubmittedEvent } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  imports: [FormsModule, RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  email = '';
  password = '';

  router = inject(Router);

  constructor(private authService: AuthService) {}

  onSignUp() {
    this.authService.signUp(this.email, this.password)
      .then(() => this.router.navigateByUrl('/homepage'))
      .catch(err => console.error('Error:', err));
  }
}
