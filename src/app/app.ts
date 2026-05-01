import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DevMockIndicatorComponent } from './core/dev/dev-mock-indicator.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DevMockIndicatorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('review-rest-frontend');
}
