import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RestaurantApiPanel } from './panels/restaurant-api.panel';
import { ReviewApiPanel } from './panels/review-api.panel';
import { UserApiPanel } from './panels/user-api.panel';

export type DevApiTabId = 'restaurants' | 'reviews' | 'users';

@Component({
  standalone: true,
  selector: 'app-dev-api-tests-page',
  imports: [CommonModule, RouterLink, RestaurantApiPanel, ReviewApiPanel, UserApiPanel],
  templateUrl: './dev-api-tests.page.html',
  styleUrl: './dev-api-tests.page.scss'
})
export class DevApiTestsPage {
  readonly tabs: { id: DevApiTabId; label: string }[] = [
    { id: 'restaurants', label: 'Restaurants' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'users', label: 'Users' }
  ];

  readonly activeTab = signal<DevApiTabId>('restaurants');

  selectTab(id: DevApiTabId): void {
    this.activeTab.set(id);
  }
}
