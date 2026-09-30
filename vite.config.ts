import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Only the (public) OAuth client ID is exposed to the browser. Service-account values are never
// referenced here, so they cannot end up in the bundle.
export default defineConfig({
  plugins: [react()],
  define: {
    __GOOGLE_CLIENT_ID__: JSON.stringify(process.env.GOOGLE_OAUTH_CLIENT_ID ?? ''),
  },
});
