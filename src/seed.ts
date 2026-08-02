// Seeds demo accounts + a couple of sample patient records.
//
// Works against whichever database is active — payload.config.ts already
// picks SQLite (dev) or MongoDB (prod) based on NODE_ENV, and this script
// just goes through the same Local API either way. Usage:
//
//   pnpm seed         local dev, seeds db.sqlite
//   pnpm seed:prod    NODE_ENV=production, seeds whatever DATABASE_URI in
//                     .env.production points at (a real MongoDB instance)
//
// Safe to re-run: every insert here checks for an existing match first.
import { getPayload } from "payload";

import config from "./payload.config";

const DEMO_USERS = [
  {
    email: "nurse@securenorth.health",
    password: "nurse-demo-pass",
    name: "Amara Okafor",
    role: "nurse",
  },
  {
    // A second nurse — needed to demo that a nurse can decrypt records she
    // submitted, but not another nurse's patients.
    email: "nurse2@securenorth.health",
    password: "nurse2-demo-pass",
    name: "Ben Torres",
    role: "nurse",
  },
  {
    email: "provider@securenorth.health",
    password: "provider-demo-pass",
    name: "Dr. Priya Sharma",
    role: "provider",
  },
  {
    email: "admin@securenorth.health",
    password: "admin-demo-pass",
    name: "IT Admin",
    role: "admin",
  },
] as const;

// One record per nurse, so the cross-nurse restriction (see DEMO.md step 5)
// is demoable immediately after seeding, without submitting anything by hand.
const SAMPLE_RECORDS = [
  {
    submittedByEmail: "nurse@securenorth.health",
    patientName: "Jane Roe",
    dateOfBirth: "1990-01-01",
    diagnosisNotes: "Suspected seasonal flu, prescribed rest and fluids.",
  },
  {
    submittedByEmail: "nurse2@securenorth.health",
    patientName: "Marcus Webb",
    dateOfBirth: "1978-11-22",
    diagnosisNotes: "Routine post-op checkup, incision healing well.",
  },
] as const;

async function seed() {
  const payload = await getPayload({ config });

  const userIdByEmail = new Map<string, number | string>();

  for (const user of DEMO_USERS) {
    const existing = await payload.find({
      collection: "users",
      where: { email: { equals: user.email } },
      limit: 1,
      overrideAccess: true,
    });

    if (existing.docs.length > 0) {
      console.log(`Skipping ${user.email} — already exists`);
      userIdByEmail.set(user.email, existing.docs[0].id);
      continue;
    }

    const created = await payload.create({
      collection: "users",
      data: user,
      overrideAccess: true,
    });
    userIdByEmail.set(user.email, created.id);
    console.log(`Created ${user.role}: ${user.email} / ${user.password}`);
  }

  for (const record of SAMPLE_RECORDS) {
    const existing = await payload.find({
      collection: "patient-records",
      overrideAccess: true,
      context: { raw: true }, // skip decrypt/redact, we're only checking existence
      where: { submittedBy: { equals: userIdByEmail.get(record.submittedByEmail) } },
      limit: 1,
    });

    if (existing.docs.length > 0) {
      console.log(`Skipping sample record for ${record.submittedByEmail} — already exists`);
      continue;
    }

    await payload.create({
      collection: "patient-records",
      data: {
        patientName: record.patientName,
        dateOfBirth: record.dateOfBirth,
        diagnosisNotes: record.diagnosisNotes,
        // payload-types.ts is generated against whichever adapter is active
        // when `pnpm generate:types` runs (SQLite locally → numeric IDs);
        // Mongo IDs are strings at runtime, so this cast just satisfies
        // the generated type — Payload itself doesn't care at runtime.
        submittedBy: userIdByEmail.get(record.submittedByEmail) as number,
      },
      overrideAccess: true,
    });
    console.log(`Created sample record "${record.patientName}" (submitted by ${record.submittedByEmail})`);
  }

  process.exit(0);
}

seed();
