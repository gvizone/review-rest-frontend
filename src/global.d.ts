export {};

declare global {
  interface Window {
    __env?: {
      firebase?: {
        apiKey?: string;
        authDomain?: string;
        projectId?: string;
        storageBucket?: string;
        messagingSenderId?: string;
        appId?: string;
      };
    };
  }
}
