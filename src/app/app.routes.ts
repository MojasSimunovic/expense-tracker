import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AddExpenseComponent } from './pages/add-expense/add-expense.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard, authGuardLoggedIn } from './guard/auth.guard';
import { LayoutComponent } from './components/layout/layout.component';
import { QrScannerComponent } from './components/qr-scanner/qr-scanner.component';
import { BillsComponent } from './components/bills/bills.component';
import { SignUpComponent } from './components/auth/sign-up/sign-up.component';
import { SignInComponent } from './components/auth/sign-in/sign-in.component';

export const routes: Routes = [
  {
    path: 'signup', 
    component:SignUpComponent, 
    canActivate: [authGuardLoggedIn],
  },
  {
    path: 'login',
    component: SignInComponent,
    canActivate: [authGuardLoggedIn],
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full'},
      { path: 'home', component: HomeComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'new', component: AddExpenseComponent },
      { path: 'new/:id', component: AddExpenseComponent },
      { path: 'qr', component: QrScannerComponent },
      { path: 'bills', component: BillsComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
