import { CommonModule } from '@angular/common';
import { Component, computed, inject, isDevMode } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { LoginModalService } from '../../core/auth/login-modal.service';
import { RestaurantSearchComponent } from '../restaurants/restaurant-search/restaurant-search.component';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [CommonModule, RouterLink, RestaurantSearchComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly loginModal = inject(LoginModalService);

  readonly isDevMode = isDevMode();
  readonly userProfile = computed(() => this.auth.userProfile());

  async logout(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigateByUrl('/home');
  }

  login(): void {
    this.loginModal.open();
  }
}
