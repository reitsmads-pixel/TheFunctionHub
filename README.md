# The Function Hub SA

South Africa's directory of function and event suppliers — venues, caterers, décor, photographers,
DJs and everything in between. Rebuilt from the original WordPress site as a fast, self-hosted
React app that is designed to be monetised through **paid supplier listings**.

- **Front end:** React 18 + TypeScript + Vite, hand-written CSS (no framework)
- **Backend:** Firebase (Auth, Firestore, Storage) — optional; the site runs without it
- **Hosting:** Netlify, deployed straight from GitHub
- **Payments:** PayFast subscriptions via two Netlify Functions

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

With no `.env` file the site starts in **demo mode**: 18 sample suppliers, a working sign-up,
listing editor, admin queue and enquiry inbox, all stored in your browser's localStorage. Nothing
is lost by clicking around — it is a showroom you can hand to a supplier before you have paid for
anything.

```bash
npm run build        # type-check + production build into dist/
npm run preview      # serve the production build locally
```

---

## How the money works

Everything chargeable is defined in one file: [`src/lib/tiers.ts`](src/lib/tiers.ts). Change a
price or a limit there and the pricing page, the comparison table, the listing editor's caps and
the search ranking all follow.

| | Basic | Featured | Premium |
|---|---|---|---|
| Price | Free | R249/mo · R2 490/yr | R599/mo · R5 990/yr |
| Photos | 1 | 10 | 30 + video |
| Categories / provinces | 1 / 1 | 3 / 3 | 5 / 9 |
| Phone, WhatsApp, website shown | — | ✓ | ✓ |
| Search placement | below paid | above Basic | top of results |
| Home-page spotlight | — | — | ✓ |
| Commission on bookings | R0 | R0 | R0 |

The two levers that actually sell upgrades are **search ranking** (`rankVendors()` in
`src/lib/vendors.ts` sorts by tier rank first) and **hidden contact details** on the free tier
(`VendorDetail.tsx` checks `tier.limits.showContactDetails`). Free listings still receive every
enquiry through the form — that is deliberate, so the free tier is genuinely useful and suppliers
have a reason to stay.

Other revenue you can add later without re-architecting anything: sponsored category placement,
a "verified" badge fee, and a featured slot in a supplier newsletter.

---

## Photographs

Three ways an image gets onto a listing, in the order they take effect:

1. **A supplier uploads one** in their dashboard. Goes to Firebase Storage,
   resized to 1600px wide in the browser first. This is the normal path.
2. **A supplier pastes an image link** — useful when their photos already live
   on their own site. Stored as a plain URL.
3. **Sample listings** read `src/data/photos.ts`, which maps a listing slug to
   files you drop in `public/img/suppliers/`. See the README in that folder.

Anything with no photograph falls back to a line drawing of its category
(`src/lib/illustrations.ts`) on a warm neutral tile. That is a deliberate
placeholder, not a design element — it keeps a half-populated directory looking
intentional, and it disappears the moment a real image arrives.

Only publish photographs you have the right to use. Stock imagery passed off as
a supplier's own work is the most common reason we reject a listing, so the
sample data ships with drawings rather than borrowed photos.

## Deploying to Netlify

1. Push this repository to GitHub.
2. In Netlify: **Add new site → Import an existing project** and pick the repo.
3. Netlify reads [`netlify.toml`](netlify.toml), so build command and publish directory are already
   set (`npm run build` → `dist`). Just click deploy.
4. Add your custom domain under **Domain management**. Point `www.thefunctionhubsa.co.za` at
   Netlify and let it issue the certificate.

The old WordPress URLs under `/Thefunctionhubsa/*` are 301-redirected to the new structure, so
existing Google results keep working.

The site deploys and works at this point, in demo mode. Everything below turns it into a real
directory.

---

## Switching on Firebase

1. Create a project at <https://console.firebase.google.com>.
2. **Build → Authentication → Sign-in method →** enable **Email/Password**.
3. **Build → Firestore Database →** create a database in production mode (region
   `europe-west1` is the closest to South Africa with good pricing).
4. **Build → Storage →** enable it, for listing photos.
5. **Project settings → Your apps → Web app →** register an app and copy the config values.
6. Put those values into Netlify under **Site settings → Environment variables**, using the names
   in [`.env.example`](.env.example), then redeploy. (Copy the same file to `.env` for local dev.)

`VITE_`-prefixed values end up in the public JavaScript bundle. That is normal for Firebase web
config — the security boundary is the rules file, not the key.

### Publish the security rules

```bash
npm install -g firebase-tools
firebase login
firebase use --add                    # pick your project
firebase deploy --only firestore:rules,storage
```

[`firestore.rules`](firestore.rules) is the important one. It enforces the part of the business
model that must not be client-side:

- anyone can read a **published** listing; drafts and pending listings stay private
- a supplier can edit their own listing but **cannot** grant themselves a paid tier, the verified
  badge, or the `published` status
- enquiries are write-only for the public and readable only by the supplier they were sent to
- the page-view and enquiry counters may each tick up by exactly one, and nothing else

### Load the sample data (optional)

```bash
# Firebase console → Project settings → Service accounts → Generate new private key
export FIREBASE_SERVICE_ACCOUNT_JSON="$(cat ~/Downloads/serviceAccountKey.json)"
npm run seed          # add --wipe to remove them again
```

### Make yourself an admin

Sign up on the site as normal, then in Firestore open `users/<your-uid>` and change
`role` from `vendor` to `admin`. `/admin` then gives you the moderation queue, plan overrides,
the verified toggle and a running MRR figure.

In demo mode, any email starting with `admin@` gets the admin role instead.

---

## Switching on payments (PayFast)

PayFast is the usual choice for ZAR recurring billing. Two Netlify Functions do the work:

| Function | Job |
|---|---|
| `netlify/functions/payfast-create.mjs` | Signs a subscription request. The **price is looked up server-side from the plan id**, so a tampered request cannot buy Premium for R1. |
| `netlify/functions/payfast-notify.mjs` | The ITN webhook. Verifies the signature, confirms the payload with PayFast, checks the merchant id and the amount, and only then raises the tier using the Admin SDK. |

Set these in Netlify (no `VITE_` prefix — they are server-side secrets):

```
PAYFAST_MERCHANT_ID
PAYFAST_MERCHANT_KEY
PAYFAST_PASSPHRASE
PAYFAST_SANDBOX=true            # false when you go live
FIREBASE_SERVICE_ACCOUNT_JSON   # the whole service-account JSON, on one line
```

…and `VITE_PAYFAST_ENABLED=true` to switch the client over.

Test against <https://sandbox.payfast.co.za> first. Your ITN URL is
`https://<your-site>/.netlify/functions/payfast-notify` — the create function fills it in
automatically.

**Until PayFast is configured, plan changes in the dashboard apply immediately without charging,
and the UI says so.** That is intentional so you can trial the flow with real suppliers.

---

## Project layout

```
src/
  components/     Layout, VendorCard, SearchBar, EnquiryForm, shared UI bits
  data/           Categories, provinces, event types, sample suppliers
  lib/
    tiers.ts        ← plans, prices and every per-tier limit
    vendors.ts      ← listing reads/writes, filtering, tier-weighted ranking
    enquiries.ts    ← enquiry submission and the supplier inbox
    billing.ts      ← checkout; hands off to the PayFast function
    firebase.ts     ← init + demo-mode detection
    demo-store.ts   ← localStorage stand-in used when Firebase is absent
    AuthContext.tsx ← sign in / sign up for both modes
  pages/
    Home, Browse, VendorDetail, Categories, Pricing, ListYourBusiness,
    SignIn, Admin, Static (about/contact/guide/faq/terms/404)
    dashboard/    Overview, ListingEditor, Enquiries, Billing
netlify/functions/  PayFast create + ITN webhook
scripts/            Firestore seeding
```

Every data function has two paths — Firestore, and the localStorage demo store — chosen by
`isDemoMode`. That is what lets the same build run with or without a backend.

---

## Things worth doing next

- **Pre-render the supplier pages.** The app is client-rendered, which is fine for users but
  limits organic search. `vite-plugin-ssr` or a small pre-render step over the published listings
  would put real HTML in front of Google, which matters a lot for a directory.
- **Email notifications.** Enquiries currently land in the dashboard; wire a Netlify Function to
  Resend or Postmark so suppliers get them by email immediately. Response time is the single
  biggest driver of whether a supplier renews.
- **Reviews.** The data model already carries `rating` and `reviewCount`; a review collection with
  moderation would be the natural next feature, and it makes the directory much harder to copy.
- **A sitemap.** Generate `sitemap.xml` at build time from the published listings.
- **Have the terms reviewed.** `/terms` is a plain-language starting point, not legal advice —
  get an attorney to check it against the CPA, ECTA and POPIA before you take real payments.
