import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AddExpenseComponent } from './pages/add-expense/add-expense.component';
import { authGuard, authGuardLoggedIn } from './guard/auth.guard';
import { QrScannerComponent } from './pages/qr-scanner/qr-scanner.component';
import { BillsComponent } from './pages/bills/bills.component';
import { SignInComponent } from './components/auth/sign-in/sign-in.component';

export const routes: Routes = [
  {
    path: 'login',
    component: SignInComponent,
    canActivate: [authGuardLoggedIn],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'new',
    component: AddExpenseComponent,
    canActivate: [authGuard],
  },
  {
    path: 'new/:id',
    component: AddExpenseComponent,
    canActivate: [authGuard],
  },
  {
    path: 'qr',
    component: QrScannerComponent,
    canActivate: [authGuard],
  },
  {
    path: 'bills',
    component: BillsComponent,
    canActivate: [authGuard],
  },
  // { path: '**', redirectTo: '' },
];
