import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { LoginModalService } from './login-modal.service';
import { DevMockLoginPanelComponent } from '../dev/dev-mock-login-panel.component';

@Component({
  standalone: true,
  selector: 'app-login-modal',
  imports: [CommonModule, DevMockLoginPanelComponent],
  templateUrl: './login-modal.component.html',
  styleUrl: './login-modal.component.scss',
})
export class LoginModalComponent {
  private readonly auth = inject(AuthService);
  protected readonly loginModal = inject(LoginModalService);

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.loginModal.close();
    }
  }

  async signInWithGoogle(): Promise<void> {
    await this.auth.signInWithProvider('google.com');
    this.loginModal.close();
  }
}
