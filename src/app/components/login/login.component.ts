import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginObj: any = {
    email: '',
    password: '',
  };

  router = inject(Router);

  onLogin() {
    if (
      this.loginObj.email === 'admin@gmail.com' &&
      this.loginObj.password === 'password'
    ) {
      this.router.navigateByUrl('home');
      localStorage.setItem('loggedUser', this.loginObj.email);
    } else {
      alert('Wrong credentials');
    }
  }
}
