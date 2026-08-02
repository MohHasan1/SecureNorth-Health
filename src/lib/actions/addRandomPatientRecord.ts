"use server";

import config from "@payload-config";
import { revalidatePath } from "next/cache";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";

const FIRST_NAMES = ["Alex", "Jordan", "Taylor", "Morgan", "Riley", "Casey", "Sam", "Jamie", "Drew", "Reese"];
const LAST_NAMES = ["Nguyen", "Patel", "Garcia", "Kim", "Brown", "Singh", "Martinez", "Chen", "O'Brien", "Diallo"];
const NOTES = [
  "Presenting with mild fever and cough, prescribed rest and fluids.",
  "Follow-up for hypertension management, blood pressure stable.",
  "Sprained ankle from a fall, wrapped and advised to elevate.",
  "Annual physical, all vitals within normal range.",
  "Persistent headache, ordered further evaluation.",
  "Allergic reaction to medication, switched prescription.",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDateOfBirth() {
  const year = 1950 + Math.floor(Math.random() * 70);
  const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, "0");
  const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Admin-only. Attributed to a random existing nurse rather than the admin
// itself — simulates "another patient came in," and overrideAccess (with
// no `user` passed) means PatientRecords' beforeChange hook won't stomp
// submittedBy with the caller's own id the way it does for a real intake.
export async function addRandomPatientRecord(): Promise<string> {
  const headers = await getHeaders();
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers });

  if (user?.role !== "admin") {
    throw new Error("Only an admin can do this.");
  }

  const nurses = await payload.find({
    collection: "users",
    where: { role: { equals: "nurse" } },
    overrideAccess: true,
    limit: 10,
  });

  if (nurses.docs.length === 0) {
    throw new Error("No nurse accounts exist yet — run “Seed demo data” first.");
  }

  const patientName = `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`;

  const created = await payload.create({
    collection: "patient-records",
    data: {
      patientName,
      dateOfBirth: randomDateOfBirth(),
      diagnosisNotes: randomFrom(NOTES),
      submittedBy: randomFrom(nurses.docs).id,
    },
    overrideAccess: true,
  });

  revalidatePath("/records");
  return `Created record #${created.id}: ${patientName}`;
}
