import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HeroBannerComponent } from "../../hero-banner/hero-banner.component";
import { NgIf } from '@angular/common';

declare var bootstrap: any;

@Component({
  selector: 'app-sign-in',
  imports: [FormsModule, HeroBannerComponent, NgIf],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  @ViewChild('#authModal') authModal!: ElementRef;
  @ViewChild('#auth-close') authCloseModal!: ElementRef;
  registerObject = {
    email : '',
     password : ''
  }
  submitError: boolean = true;
  router = inject(Router);
  authService = inject(AuthService);

  onLogin() {
    this.authService.signIn(this.registerObject.email, this.registerObject.password)
      .then(() => this.router.navigateByUrl('/home'))
      .catch(err => {
      console.error('Error:this is', err);
      this.submitError = true;
      });
  }

  closeModal() {
    document.getElementById('auth-close')?.click();
  }

  signInWithGoogle() {
    this.authService.signInWithGoogle()
      .then(this.closeModal)
      .then(res =>this.router.navigateByUrl('/home'))
      .catch(err => console.error('Error:', err));
  }

  onRegister() {
    this.authService.signUp(this.registerObject.email, this.registerObject.password)
      .then(this.closeModal)
      .then(() => this.router.navigateByUrl('/home'))
      .catch(err => {
      console.error('Error:this is', err);
      this.submitError = true;
    });
  }
  onModalClose(form: NgForm, formSignup: NgForm) {
    form.resetForm();
    formSignup.resetForm();
  }
}