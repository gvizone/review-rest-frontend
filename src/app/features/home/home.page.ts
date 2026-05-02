import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AppTopbarComponent } from '../../core/layout/app-topbar.component';
import { RestaurantSearchComponent } from '../restaurants/restaurant-search/restaurant-search.component';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [CommonModule, AppTopbarComponent, RestaurantSearchComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {}
