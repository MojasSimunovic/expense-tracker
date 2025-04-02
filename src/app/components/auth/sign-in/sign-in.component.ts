import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-sign-in',
  imports: [FormsModule, RouterLink],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  email = '';
  password = '';
  submitError: boolean = true;
  router = inject(Router);
  authService = inject(AuthService);

  onSignIn() {
    this.authService.signIn(this.email, this.password)
      .then(() => this.router.navigateByUrl('/homepage'))
      .catch(err => {
      console.error('Error:this is', err);
      this.submitError = true;
      });
  }

  signInWithGoogle() {
    this.authService.signInWithGoogle()
      .then(res =>this.router.navigateByUrl('/homepage'))
      .catch(err => console.error('Error:', err));
  }
}