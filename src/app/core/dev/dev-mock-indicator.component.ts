import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { isDevMode } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { DevHarnessService } from './dev-harness.service';

function isLoginPath(url: string): boolean {
  const path = url.split('?')[0];
  return path === '/login';
}

/** Non-interactive banner when mock mode is on (not on login — toggle lives there). */
@Component({
  standalone: true,
  selector: 'app-dev-mock-indicator',
  templateUrl: './dev-mock-indicator.component.html',
  styleUrl: './dev-mock-indicator.component.scss',
})
export class DevMockIndicatorComponent {
  private readonly router = inject(Router);
  private readonly harness = inject(DevHarnessService);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly visible = computed(
    () => isDevMode() && this.harness.mockEnabled() && !isLoginPath(this.url()),
  );
}
