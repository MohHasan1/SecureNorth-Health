import config from "@payload-config";
import { notFound, redirect } from "next/navigation";
import { getPayload } from "payload";

import type { DecryptResult } from "@/components/portal/BehindTheScenesPanel";
import { EditRecordForm } from "@/components/portal/EditRecordForm";
import { getCurrentUser } from "@/lib/getCurrentUser";

function plaintextOrNull(result: DecryptResult): string | null {
  if (result.restricted || "tampered" in result) return null;
  return result.plaintext;
}

export default async function EditRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect(`/records/${id}`);

  const payload = await getPayload({ config });

  const record = await payload
    .findByID({
      collection: "patient-records",
      id,
      user,
      overrideAccess: false,
      depth: 0,
    })
    .catch(() => null);

  if (!record) notFound();

  const patientName = plaintextOrNull(record.patientName as unknown as DecryptResult);
  const dateOfBirth = plaintextOrNull(record.dateOfBirth as unknown as DecryptResult);
  const diagnosisNotes = plaintextOrNull(record.diagnosisNotes as unknown as DecryptResult);

  if (patientName === null || dateOfBirth === null || diagnosisNotes === null) {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="text-xl font-semibold">Record #{id}</h1>
        <p className="mt-3 text-sm text-danger">
          This record couldn't be decrypted (likely tampered ciphertext) — nothing to edit.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-xl font-semibold">Edit record #{id}</h1>
      <p className="mt-1 text-sm text-muted">
        Saving re-encrypts every field fresh, with a new IV — same as any other write.
      </p>
      <div className="mt-6">
        <EditRecordForm
          recordId={id}
          initialPatientName={patientName}
          initialDateOfBirth={dateOfBirth}
          initialDiagnosisNotes={diagnosisNotes}
        />
      </div>
    </div>
  );
}
