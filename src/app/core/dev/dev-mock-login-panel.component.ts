import { Component, inject } from '@angular/core';
import { isDevMode } from '@angular/core';
import { DevHarnessService } from './dev-harness.service';

/** Mock mode toggle — only shown on the login page (dev builds). */
@Component({
  standalone: true,
  selector: 'app-dev-mock-login-panel',
  templateUrl: './dev-mock-login-panel.component.html',
  styleUrl: './dev-mock-login-panel.component.scss',
})
export class DevMockLoginPanelComponent {
  protected readonly harness = inject(DevHarnessService);

  readonly shown = isDevMode();

  onMockChange(checked: boolean): void {
    this.harness.setMock(checked);
  }
}
