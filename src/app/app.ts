import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DevMockIndicatorComponent } from './core/dev/dev-mock-indicator.component';
import { AddRestaurantModalComponent } from './features/restaurants/add-resraurant-modal/add-restaurant-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AddRestaurantModalComponent, DevMockIndicatorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('review-rest-frontend');
}
