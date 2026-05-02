import { Component, computed, inject } from '@angular/core';
import { isDevMode } from '@angular/core';
import { DevHarnessService } from '../../services/dev/dev-harness.service';

/** Non-interactive banner when mock mode is on (dev builds). */
@Component({
  standalone: true,
  selector: 'app-dev-mock-indicator',
  templateUrl: './dev-mock-indicator.component.html',
  styleUrl: './dev-mock-indicator.component.scss',
})
export class DevMockIndicatorComponent {
  private readonly harness = inject(DevHarnessService);

  readonly visible = computed(() => isDevMode() && this.harness.mockEnabled());
}
