// Copy this file to `public/env.js` and replace values at deploy time.
// Do NOT commit `public/env.js` if it contains real keys.
window.__env = window.__env || {};
window.__env.firebase = {
  apiKey: '${FIREBASE_API_KEY}',
  authDomain: '${FIREBASE_AUTH_DOMAIN}',
  projectId: '${FIREBASE_PROJECT_ID}',
  storageBucket: '${FIREBASE_STORAGE_BUCKET}',
  messagingSenderId: '${FIREBASE_MESSAGING_SENDER_ID}',
  appId: '${FIREBASE_APP_ID}'
};
