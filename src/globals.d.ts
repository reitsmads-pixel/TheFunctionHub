declare const __GOOGLE_CLIENT_ID__: string;

// Minimal typings for Google Identity Services (https://accounts.google.com/gsi/client).
interface GoogleCredentialResponse {
  credential: string;
}
interface Window {
  google?: {
    accounts: {
      id: {
        initialize(options: { client_id: string; callback: (r: GoogleCredentialResponse) => void; auto_select?: boolean }): void;
        renderButton(el: HTMLElement, options: { theme?: string; size?: string; text?: string; shape?: string }): void;
        disableAutoSelect(): void;
      };
    };
  };
}
