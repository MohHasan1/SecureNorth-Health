"use server";

import config from "@payload-config";
import { revalidatePath } from "next/cache";
import { getPayload } from "payload";

import type { EncryptedField } from "@/lib/crypto/encryption";

const PHI_FIELDS = ["patientName", "dateOfBirth", "diagnosisNotes"] as const;
type PhiField = (typeof PHI_FIELDS)[number];

// No auth check here on purpose. This is the write-side counterpart to
// /breach's read-only dump. It simulates an attacker who already has raw
// write access to the storage layer (e.g. a compromised backup, not the
// app's own login), so it goes straight to the DB the same way the app's
// own beforeChange hook does: an EncryptedField object is passed through
// unchanged, whatever bytes it contains.
export async function breachWrite(recordId: string, field: PhiField, value: EncryptedField) {
  if (!PHI_FIELDS.includes(field)) {
    throw new Error(`Unknown field: ${field}`);
  }

  const payload = await getPayload({ config });

  await payload.update({
    collection: "patient-records",
    id: recordId,
    data: { [field]: value },
    overrideAccess: true,
    context: { raw: true },
  });

  revalidatePath("/breach");
}
