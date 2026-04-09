import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [CommonModule],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss'
})
export class HomePage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly user = toSignal(this.auth.user$, { initialValue: null });
  readonly userEmail = computed(() => this.user()?.email ?? '—');
  readonly userName = computed(() => this.user()?.displayName ?? '—');

  async logout(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigateByUrl('/login');
  }
}
