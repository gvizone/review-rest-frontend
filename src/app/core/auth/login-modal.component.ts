import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { LoginModalService } from '../../services/ui/login-modal.service';
import { RegisterModalService } from '../../services/ui/register-modal.service';
import { DevMockLoginPanelComponent } from '../dev/dev-mock-login-panel.component';
import { UserApiService } from '../../services/api/user-api.service';
import { firstValueFrom, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
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
  private readonly registerModal = inject(RegisterModalService);
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
        this.registerModal.open();
      }
    } catch {
      // Popup closed or sign-in failed — keep modal open or close in finally
    } finally {
      this.loginModal.close();
    }
  }
}
