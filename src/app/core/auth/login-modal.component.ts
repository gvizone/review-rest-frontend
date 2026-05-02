import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { LoginModalService } from './login-modal.service';
import { DevMockLoginPanelComponent } from '../dev/dev-mock-login-panel.component';
import { UserApiService } from '../api/user-api.service';
import { firstValueFrom, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login-modal',
  imports: [CommonModule, DevMockLoginPanelComponent],
  templateUrl: './login-modal.component.html',
  styleUrl: './login-modal.component.scss',
})
export class LoginModalComponent {
  private readonly auth = inject(AuthService);
  private readonly userApi = inject(UserApiService);
  private readonly router = inject(Router);
  protected readonly loginModal = inject(LoginModalService);

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.loginModal.close();
    }
  }

  async signInWithGoogle(): Promise<void> {
    try {
      const firebaseUser = await this.auth.signInWithProvider('google.com');
      if (!firebaseUser?.email) {
        return;
      }
      const backendUser = await firstValueFrom(
        this.userApi.findByEmail(firebaseUser.email).pipe(
          take(1),
          catchError(() => of(null)),
        ),
      );
      if (!backendUser) {
        await this.router.navigateByUrl('/register');
      }
    } catch {
      // Popup closed or sign-in failed — keep modal open or close in finally
    } finally {
      this.loginModal.close();
    }
  }
}
