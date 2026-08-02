import type { Payload } from "payload";

import type { PatientRecord } from "@/payload-types";

const DEMO_USERS = [
  {
    email: "nurse@securenorth.health",
    password: "nurse-demo-pass",
    name: "Amara Okafor",
    role: "nurse",
  },
  {
    // A second nurse. Needed to demo that a nurse can decrypt records she
    // submitted, but not another nurse's patients.
    email: "nurse2@securenorth.health",
    password: "nurse2-demo-pass",
    name: "Ben Torres",
    role: "nurse",
  },
  {
    email: "doctor@securenorth.health",
    password: "doctor-demo-pass",
    name: "Dr. Priya Sharma",
    role: "doctor",
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

// Shared by the CLI script (src/seed.ts, for local/pnpm seed:prod use) and
// the in-app admin "Seed demo data" page (for deployed environments with
// no terminal to run the CLI against). One seeding implementation, two ways
// to trigger it. Safe to re-run: everything checks for an existing match
// before creating anything.
export async function seedDemoData(payload: Payload): Promise<string[]> {
  const log: string[] = [];
  const userIdByEmail = new Map<string, number | string>();

  for (const user of DEMO_USERS) {
    const existing = await payload.find({
      collection: "users",
      where: { email: { equals: user.email } },
      limit: 1,
      overrideAccess: true,
    });

    if (existing.docs.length > 0) {
      log.push(`Skipping ${user.email}, already exists`);
      userIdByEmail.set(user.email, existing.docs[0].id);
      continue;
    }

    const created = await payload.create({
      collection: "users",
      data: user,
      overrideAccess: true,
    });
    userIdByEmail.set(user.email, created.id);
    log.push(`Created ${user.role}: ${user.email} / ${user.password}`);
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
      log.push(`Skipping sample record for ${record.submittedByEmail}, already exists`);
      continue;
    }

    await payload.create({
      collection: "patient-records",
      data: {
        patientName: record.patientName,
        dateOfBirth: record.dateOfBirth,
        diagnosisNotes: record.diagnosisNotes,
        submittedBy: userIdByEmail.get(record.submittedByEmail) as PatientRecord["submittedBy"],
      },
      overrideAccess: true,
    });
    log.push(`Created sample record "${record.patientName}" (submitted by ${record.submittedByEmail})`);
  }

  return log;
}
