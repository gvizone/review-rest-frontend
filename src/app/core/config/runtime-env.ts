export type RuntimeFirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

export function getRuntimeFirebaseConfig(): RuntimeFirebaseConfig | null {
  const cfg = window.__env?.firebase;
  if (!cfg?.apiKey || !cfg?.authDomain || !cfg?.projectId) return null;
  return {
    apiKey: cfg.apiKey,
    authDomain: cfg.authDomain,
    projectId: cfg.projectId,
    storageBucket: cfg.storageBucket,
    messagingSenderId: cfg.messagingSenderId,
    appId: cfg.appId
  };
}
