import type { User } from 'firebase/auth';

/** Matches `DevHarnessService` mock identity; keep email in sync for guards and API mocks. */
export const DEV_MOCK_AUTH_EMAIL = 'dev@local.review';
export const DEV_MOCK_AUTH_DISPLAY_NAME = 'Dev User';

/**
 * Minimal `User` stand-in for dev mock auth (no Firebase session).
 * Bearer interceptor sends a fixed token when this mode is on.
 */
export const DEV_MOCK_FIREBASE_USER = {
  uid: 'dev-mock-firebase-uid',
  email: DEV_MOCK_AUTH_EMAIL,
  emailVerified: true,
  displayName: DEV_MOCK_AUTH_DISPLAY_NAME,
  isAnonymous: false,
  phoneNumber: null,
  photoURL: null,
  providerId: 'firebase',
  metadata: {} as User['metadata'],
  providerData: [],
  refreshToken: '',
  tenantId: null as string | null,
  delete: async () => {},
  getIdToken: async () => 'dev-mock-id-token',
  getIdTokenResult: async () => {
    throw new Error('getIdTokenResult not used in dev mock');
  },
  reload: async () => {},
  toJSON: () => ({}),
} as unknown as User;
