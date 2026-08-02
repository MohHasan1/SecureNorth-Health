# Demo runbook

This app is the "Practical Demonstration" segment for the SEN800 SecureNorth
Health presentation. It's a small nurse-intake portal that shows exactly
what happens to a patient record after submission: encryption in transit,
encryption at rest (AES-256-GCM), role-gated decryption, and live tamper
detection.

## One-time setup

```bash
pnpm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"   # -> PATIENT_FIELD_ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"      # -> PAYLOAD_SECRET
```

```bash
pnpm dev     # http://localhost:3000 — also creates db.sqlite and pushes the schema
pnpm seed    # creates the 4 demo accounts + 2 sample patient records below
```

To reset to a clean slate before a take: `rm db.sqlite && pnpm seed`.

## Database: SQLite locally, MongoDB in production

`src/payload.config.ts` picks the adapter based on `NODE_ENV` — nothing to
configure by hand:

- **Dev** (`NODE_ENV` unset, i.e. `pnpm dev`): SQLite, `db.sqlite`, zero setup.
- **Production** (`NODE_ENV=production`, i.e. `pnpm build && pnpm start`):
  MongoDB, using `DATABASE_URI` from `.env.production` (copy
  `.env.production.example` and fill in a real connection string, e.g. a
  free MongoDB Atlas cluster).

To seed a production/Mongo database the same way as local dev:

```bash
cp .env.production.example .env.production   # fill in DATABASE_URI, PAYLOAD_SECRET, PATIENT_FIELD_ENCRYPTION_KEY
pnpm seed:prod
```

That works from your own machine even after deploying, since MongoDB is a
network database — `DATABASE_URI` just needs to point at the real cluster,
no SSH or terminal access to the deployed app required.

**After that first run**, once at least one admin account exists, you can
also reseed (e.g. add the sample records back after a database reset)
straight from the deployed app itself: log in as admin → **"Seed data"** in
the nav → **/admin-tools/seed**. Same underlying logic as `pnpm seed`, just
triggered by a button instead of a script — useful once there's no local
terminal in the loop at all. It can't bootstrap the very first admin from a
completely empty database, though — that one time still needs `pnpm
seed:prod` run locally.

`seed.ts` is the same script either way — it just goes through Payload's
Local API, which already points at whichever database `payload.config.ts`
picked. Both the accounts and the sample records are safe to re-run: it
checks for an existing match before creating anything.

## Demo accounts

| Role     | Email                          | Password            | Can decrypt PHI? |
| -------- | ------------------------------- | -------------------- | ----------------- |
| Nurse    | nurse@securenorth.health        | nurse-demo-pass      | Only records *she* submitted |
| Nurse 2  | nurse2@securenorth.health        | nurse2-demo-pass     | Only records *she* submitted (not Nurse's) |
| Provider | provider@securenorth.health     | provider-demo-pass   | Any record — a doctor needs full patient context |
| Admin    | admin@securenorth.health        | admin-demo-pass      | Any record, plus /admin-tools/seed |

Note: `pnpm seed` also creates 2 sample patient records so `/records` isn't
empty while you're just poking around — for the actual recording, submit a
fresh one live as described below rather than pointing at the seeded data,
it's a better demo.

## Two views of the same record

- **Nurse and provider** get an ordinary patient-record page — name, DOB,
  diagnosis notes, nothing else. That's the realistic view: a real hospital
  portal doesn't show a nurse raw ciphertext.
- **Admin** viewing the exact same URL gets the full "behind the scenes"
  breakdown instead — what went out over the wire, the raw `iv` /
  `ciphertext` / `authTag` as actually stored, and the literal JSON the
  decrypt hook returned. That split happens automatically in
  `records/[id]/page.tsx`, based on role.

## Recording script

1. **Sign in as the nurse**, go to "New patient record", submit one (e.g.
   Jane Roe / 1990-01-01 / "Suspected flu, prescribed rest"). You land on
   `/records/[id]` showing the plain patient view — she can see it because
   it's the patient she just admitted, not because everyone can see
   everything.
2. **Sign out, sign in as Nurse 2**, go to `/records`. Jane Roe isn't even
   in the list, and the record URL 404s directly — a different nurse's
   patient is invisible, not just redacted. That's the least-privilege fix
   for "access control policies not reviewed in two years."
3. **Sign out, sign in as the provider**, open Jane Roe's record. Same
   plain patient view, real plaintext, even though this provider didn't
   submit it — a treating clinician needs that broader access, unlike a
   nurse.
4. **Sign out, sign in as the admin**, open the same record URL. Now you
   get the full technical breakdown: section 1 (in transit), section 2 (the
   real `iv`/`ciphertext`/`authTag` — safe to show, meaningless without the
   key), section 3 (the literal decrypt-hook output as JSON).
5. **Open `/pwned` in a new tab** — a flashy "you've breached the DB" splash
   screen (skull, glitch text, the works) for a bit of theater, then click
   **"ACCESS DATABASE"** through to `/breach`: a separate, unauthenticated
   "attacker's view" simulating someone who got direct database access
   (e.g. via the misconfigured cloud storage bucket from the brief),
   bypassing the app and its login entirely. Every field is raw,
   **editable** `iv` / `ciphertext` / `authTag` — a live connection to the
   DB, no login needed.
6. **On `/breach`**, edit a couple of characters in `diagnosisNotes`'s
   `ciphertext` field and click **"$ commit tampering."** This writes your
   edit straight to the DB — acting as an attacker with storage write
   access, not going through the app's normal update flow at all.
7. **Switch back to the nurse or provider tab and reload the record.**
   Instead of corrupted or silently-wrong text, it now says *"This record
   couldn't be verified — contact IT"* — realistic wording for a real
   portal. Reload as admin instead to see the literal
   **⚠ Auth tag verification failed** / `tampered: true` version. Either
   way, that's AES-GCM's authentication tag doing its job — contrast with a
   non-authenticated mode (e.g. plain CBC), which would have silently
   decrypted to different-but-plausible-looking garbage instead of
   detecting the tampering at all.

> **Note on `/breach`:** it has no login and no access control on purpose —
> it's not a real endpoint of the app, it's a standalone visualization of
> "what does an attacker with raw storage read/write access can do." It's
> safe to leave unprotected: reading it only ever shows ciphertext (no
> plaintext, no encryption key — nothing an attacker couldn't already get
> from `db.sqlite` directly), and editing it can only ever produce *more*
> ciphertext, never valid plaintext, since the key never touches this page.

## "In transit" — real TLS, not a diagram

Run a tunnel to get a real, publicly-trusted HTTPS URL in front of the
local dev server (no self-signed cert warnings to explain away):

```bash
brew install cloudflared   # or: https://github.com/cloudflare/cloudflared
cloudflared tunnel --url http://localhost:3000
```

Open the printed `https://*.trycloudflare.com` URL instead of localhost,
repeat the nurse login/submit steps, and show DevTools → Network: the
padlock, the TLS handshake, and the request payload — genuinely
unreadable on the wire, not simulated.

## Talking points (mode + key handling, per the practical-demo brief)

- **Why AES-256-GCM over CBC:** GCM is authenticated encryption — it
  produces an auth tag that detects any post-encryption modification,
  which is exactly what steps 6–7 above demonstrate live. CBC alone gives
  confidentiality but no integrity check, so a flipped bit would just
  decrypt to silently-wrong plaintext instead of raising an error.
- **How the key is handled:** `PATIENT_FIELD_ENCRYPTION_KEY` is a 32-byte
  key loaded from an environment variable — a stand-in for what a real
  deployment would pull from a KMS (AWS KMS / Azure Key Vault / GCP KMS)
  at boot, never committed to source control and never stored alongside
  the ciphertext it protects.
