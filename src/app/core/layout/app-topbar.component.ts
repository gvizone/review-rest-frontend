import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, isDevMode } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { startWith } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';
import { LoginModalService } from '../../services/ui/login-modal.service';
import { AppLang, applyDocumentLang, writeStoredAppLang } from '../i18n/app-lang.storage';

@Component({
  standalone: true,
  selector: 'app-topbar',
  imports: [CommonModule, RouterLink, TranslocoPipe],
  templateUrl: './app-topbar.component.html',
  styleUrl: './app-topbar.component.scss',
})
export class AppTopbarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly loginModal = inject(LoginModalService);
  private readonly transloco = inject(TranslocoService);

  /** Show link back to discovery (home search). */
  readonly showDiscovery = input(false);

  readonly isDevMode = isDevMode();
  readonly userProfile = computed(() => this.auth.userProfile());

  protected readonly activeLang = toSignal(
    this.transloco.langChanges$.pipe(startWith(this.transloco.getActiveLang())),
    { initialValue: this.transloco.getActiveLang() },
  );

  login(): void {
    this.loginModal.open();
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigateByUrl('/home');
  }

  setLang(lang: AppLang): void {
    if (this.transloco.getActiveLang() === lang) {
      return;
    }
    this.transloco.setActiveLang(lang);
    writeStoredAppLang(lang);
    applyDocumentLang(lang);
  }
}
