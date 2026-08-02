import config from "@payload-config";
import { notFound, redirect } from "next/navigation";
import { getPayload } from "payload";

import { BehindTheScenesPanel, type DecryptResult } from "@/components/portal/BehindTheScenesPanel";
import { PatientRecordView } from "@/components/portal/PatientRecordView";
import type { EncryptedField } from "@/lib/crypto/encryption";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function RecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const payload = await getPayload({ config });

  // Respects this viewer's actual role. A nurse gets redacted PHI here,
  // a doctor/admin gets the decrypted plaintext.
  const roleGated = await payload
    .findByID({
      collection: "patient-records",
      id,
      user,
      overrideAccess: false,
      depth: 0,
    })
    .catch(() => null);

  if (!roleGated) notFound();

  const decrypted = {
    patientName: roleGated.patientName as unknown as DecryptResult,
    dateOfBirth: roleGated.dateOfBirth as unknown as DecryptResult,
    diagnosisNotes: roleGated.diagnosisNotes as unknown as DecryptResult,
  };

  // Nurse and doctor get an ordinary patient-record view, like a real
  // EHR. The crypto-internals breakdown (ciphertext, raw hook output, the
  // "in transit" explanation) is admin-only. Not something a real
  // hospital portal would show a clinician day to day.
  if (user.role !== "admin") {
    return <PatientRecordView recordId={id} decrypted={decrypted} />;
  }

  // The raw ciphertext blob is safe to show, it's meaningless without the
  // server-side key, so this bypasses the redaction just to prove what's
  // actually sitting in the database.
  const raw = await payload.findByID({
    collection: "patient-records",
    id,
    overrideAccess: true,
    context: { raw: true },
    depth: 0,
  });

  return (
    <BehindTheScenesPanel
      recordId={id}
      raw={{
        patientName: raw.patientName as unknown as EncryptedField,
        dateOfBirth: raw.dateOfBirth as unknown as EncryptedField,
        diagnosisNotes: raw.diagnosisNotes as unknown as EncryptedField,
      }}
      decrypted={decrypted}
    />
  );
}
