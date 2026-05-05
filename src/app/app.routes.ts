import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { devOnlyGuard } from './core/guards/dev-only.guard';
import { HomePage } from './features/home/home.page';
import { ProfilePage } from './features/profile/profile.page';
import { RestaurantDetailPage } from './features/restaurants/restaurant-detail/restaurant-detail.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    component: HomePage,
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    component: ProfilePage,
  },
  {
    path: 'restaurants/:id',
    component: RestaurantDetailPage,
  },
  {
    path: 'dev/api-tests',
    canActivate: [devOnlyGuard],
    loadComponent: () =>
      import('./features/dev-api-tests/dev-api-tests.page').then((m) => m.DevApiTestsPage),
  },
  { path: '**', redirectTo: 'home' },
];
