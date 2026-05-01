import { CommonModule } from '@angular/common';
import { Component, computed, inject, isDevMode } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly showDevApiLink = isDevMode();

  readonly userProfile = computed(() => this.auth.userProfile());
  readonly userEmail = computed(() => this.userProfile()?.email ?? '—');
  readonly userName = computed(() => this.userProfile()?.displayName ?? '—');

  async logout(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigateByUrl('/home');
  }

  login() {
    this.router.navigateByUrl('/login');
  }
}
