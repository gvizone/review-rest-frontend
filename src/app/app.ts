import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DevMockIndicatorComponent } from './core/dev/dev-mock-indicator.component';
import { LoginModalComponent } from './core/auth/login-modal.component';
import { AddRestaurantModalComponent } from './features/restaurants/add-restaurant-modal/add-restaurant-modal.component';
import { CreateReviewModalComponent } from './features/restaurants/create-review-modal/create-review-modal.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    LoginModalComponent,
    AddRestaurantModalComponent,
    CreateReviewModalComponent,
    DevMockIndicatorComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('review-rest-frontend');
}
