import { Routes } from '@angular/router';
import { devOnlyGuard } from './core/guards/dev-only.guard';
import { HomePage } from './features/home/home.page';
import { RestaurantDetailPage } from './features/restaurants/restaurant-detail/restaurant-detail.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    component: HomePage,
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
