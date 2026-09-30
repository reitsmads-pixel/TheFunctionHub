# Preform Tablets

Internal dashboard for locking down Preform (Pty) Ltd's Samsung tablets with Google's
[Android Management API](https://developers.google.com/android/management) (AMAPI). There is no custom
Android app: the tablets are controlled entirely by AMAPI policies.

- **Frontend:** React + Vite, served by Netlify at <https://thefunctionhub.netlify.app>.
- **Backend:** Netlify Functions in `netlify/functions/` (TypeScript). They are the only code that talks to
  Google and the only place the service-account key is used.
- **Login:** "Sign in with Google". Every function verifies the Google ID token server-side and rejects any
  account not listed in `ADMIN_EMAILS`.

> Status: **Phase 1** (Google Cloud + enterprise setup). Devices, enrollment, policies and the full docs
> follow in later phases.

## Environment variables (Netlify)

Set these under **Site configuration → Environment variables**. See [`.env.example`](.env.example).

| Variable | Scope | Purpose |
|---|---|---|
| `GOOGLE_SA_CLIENT_EMAIL` | Functions | Service account email (`client_email` in the key file) |
| `GOOGLE_SA_PRIVATE_KEY` | Functions | Service account key (`private_key` in the key file), pasted as-is |
| `GCP_PROJECT_ID` | Functions | `thefunctionhub` |
| `GOOGLE_OAUTH_CLIENT_ID` | Builds + Functions | OAuth web client ID for sign-in (public) |
| `ADMIN_EMAILS` | Functions | Comma-separated Google accounts allowed in |
| `AMAPI_ENTERPRISE` | Functions | `enterprises/…`, filled in after the one-off signup at `/setup` |

Only the two service-account values are secret. Only those two are needed from the key file, which keeps
the function environment under AWS Lambda's 4 KB limit. Never commit the key file; `.gitignore` blocks the
usual names.

## Security

- The service account has a single role: **Android Management User**.
- No endpoint does anything before `requireAdmin()` succeeds; every input is validated against a strict
  pattern.
- The site sends a strict Content-Security-Policy, is excluded from search engines and cannot be framed.

## Local development

```bash
npm install
npm run build      # typechecks the frontend and the functions, then builds
```
