import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { HomePage } from './features/home/home.page';
import { LoginPage } from './features/login/login.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'login', component: LoginPage },
  { path: 'home', component: HomePage, canActivate: [authGuard] },
  { path: '**', redirectTo: 'home' }
];
