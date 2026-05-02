import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, isDevMode } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { LoginModalService } from '../auth/login-modal.service';

@Component({
  standalone: true,
  selector: 'app-topbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './app-topbar.component.html',
  styleUrl: './app-topbar.component.scss',
})
export class AppTopbarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly loginModal = inject(LoginModalService);

  /** Show link back to discovery (home search). */
  readonly showDiscovery = input(false);

  readonly isDevMode = isDevMode();
  readonly userProfile = computed(() => this.auth.userProfile());

  login(): void {
    this.loginModal.open();
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigateByUrl('/home');
  }
}
