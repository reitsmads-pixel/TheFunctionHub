# Preform Tablets

Internal dashboard for locking down Preform (Pty) Ltd's Samsung tablets with Google's
[Android Management API](https://developers.google.com/android/management) (AMAPI). There is no custom
Android app: the tablets are controlled entirely by AMAPI policies.

- **Frontend:** React + Vite, served by Netlify at <https://thefunctionhub.netlify.app>.
- **Backend:** Netlify Functions in `netlify/functions/` (TypeScript). They are the only code that talks to
  Google and the only place the service-account key is used.
- **Login:** "Sign in with Google". Every function verifies the Google ID token server-side and rejects any
  account not listed in `ADMIN_EMAILS`.

> Status: **Phase 2** (functions). Enterprise: `enterprises/LC00vw46h0`. The dashboard pages, lockdown
> policies and full docs follow in later phases.

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

## API (Netlify Functions)

Every endpoint requires a signed-in, allowlisted admin.

| Endpoint | Does |
|---|---|
| `GET /api/me` | Who is signed in, which enterprise is configured |
| `GET /api/devices` | All tablets: label, serial, model, policy, compliance, last seen, battery |
| `POST /api/devices/policy` | Move a tablet to another policy `{ deviceId, policyId }` |
| `POST /api/devices/command` | `{ deviceId, type: LOCK \| REBOOT \| RESET_PASSWORD, newPassword? }` (PIN: 6–16 digits) |
| `POST /api/devices/delete` | Wipe and remove a tablet `{ deviceId, confirm }`; `confirm` must be its serial number |
| `POST /api/enrollment` | Enrollment QR for a policy `{ policyId, hours?, label?, wifi? }` |
| `GET /api/policies[?id=]` | Policies in the repo and at Google |
| `POST /api/policies/push` | `{ id, fromRepo: true }` or `{ id, policy }` |
| `POST /api/setup/*` | One-off enterprise signup (refuses once `AMAPI_ENTERPRISE` is set) |

## Policies

`policies/*.json` are the master copies. `npm run check-policies` validates them against the live AMAPI
reference and fails on unknown fields, deprecated fields and invalid values.

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
