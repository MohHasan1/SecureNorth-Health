# SecureNorth Health — encryption demo

A small nurse-intake portal built for the SEN800 "SecureNorth Health"
practical demonstration. It simulates a nurse submitting a patient record
and exposes what happens behind the scenes: encryption in transit,
AES-256-GCM encryption at rest, role-gated decryption, and live tamper
detection.

**Stack:** Next.js 16 (App Router) + Payload CMS 3, TypeScript, Tailwind
CSS. SQLite in development, MongoDB in production — picked automatically
by `NODE_ENV`, see `src/payload.config.ts`.

See [DEMO.md](./DEMO.md) for setup, demo accounts, and the recording
script.

## Project layout

```
src/
  app/
    (payload)/          Payload's required admin + REST API routes
    (portal)/            nurse/provider/admin-facing pages (login, intake, records/[id])
    (hacker)/pwned/      flashy "breach" splash screen, links to /breach
    (hacker)/breach/     unauthenticated, editable "attacker with raw DB access" view
  collections/            Users, PatientRecords, AccessLogs
  components/portal/      intake form, behind-the-scenes panel, tamper button
  lib/
    crypto/encryption.ts  AES-256-GCM encrypt/decrypt
    actions/               server action for the tamper demo
  payload.config.ts        picks SQLite (dev) or MongoDB (prod) by NODE_ENV
  seed.ts                  creates the 4 demo accounts + sample records — run with
                            `pnpm seed` (dev) or `pnpm seed:prod` (production/Mongo)
```
