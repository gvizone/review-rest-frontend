import { FirebaseOptions } from 'firebase/app';
import { environment } from '../../../environments/environment';
import { getRuntimeFirebaseConfig } from '../config/runtime-env';

function assertFirebaseOptions(opts: Partial<FirebaseOptions>): asserts opts is FirebaseOptions {
  if (!opts.apiKey || !opts.authDomain || !opts.projectId) {
    throw new Error(
      'Missing Firebase config. Provide it via `public/env.js` (window.__env.firebase) or `src/environments/environment.*.ts`.'
    );
  }
}

export function getFirebaseOptions(): FirebaseOptions {
  const runtime = getRuntimeFirebaseConfig();
  const opts: Partial<FirebaseOptions> = runtime ?? (environment.firebase as Partial<FirebaseOptions>);
  assertFirebaseOptions(opts);
  return opts;
}
