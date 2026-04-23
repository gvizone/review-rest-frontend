import { Routes } from '@angular/router';
import { devOnlyGuard } from './core/guards/dev-only.guard';
import { HomePage } from './features/home/home.page';
import { LoginPage } from './features/login/login.page';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'login', component: LoginPage },
  {
    path: 'home',
    component: HomePage,
    canActivate: [authGuard]
  },
  {
    path: 'dev/api-tests',
    canActivate: [devOnlyGuard],
    loadComponent: () =>
      import('./features/dev-api-tests/dev-api-tests.page').then((m) => m.DevApiTestsPage)
  },
  { path: '**', redirectTo: 'home' }
];
