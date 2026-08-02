"use server";

import config from "@payload-config";
import { revalidatePath } from "next/cache";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";

import type { EncryptedField } from "@/lib/crypto/encryption";

const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// Flips the first base64 character of the ciphertext to a different valid
// base64 character. That's a real bit-flip on the underlying ciphertext
// bytes — enough for AES-GCM's auth tag check to fail on the next decrypt.
function corrupt(field: EncryptedField): EncryptedField {
  const chars = field.ciphertext.split("");
  const current = chars[0];
  const next = BASE64_ALPHABET[(BASE64_ALPHABET.indexOf(current) + 1) % BASE64_ALPHABET.length];
  chars[0] = next;
  return { ...field, ciphertext: chars.join("") };
}

export async function tamperWithRecord(recordId: string) {
  const headers = await getHeaders();
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers });

  if (user?.role !== "admin") {
    throw new Error("Only an admin can run the tamper demo.");
  }

  const raw = await payload.findByID({
    collection: "patient-records",
    id: recordId,
    overrideAccess: true,
    context: { raw: true },
  });

  await payload.update({
    collection: "patient-records",
    id: recordId,
    data: {
      diagnosisNotes: corrupt(raw.diagnosisNotes as unknown as EncryptedField),
    },
    overrideAccess: true,
    context: { raw: true },
  });

  await payload.create({
    collection: "access-logs",
    data: { user: user.id, record: Number(recordId), action: "tamper" },
    overrideAccess: true,
  });

  revalidatePath(`/records/${recordId}`);
}
