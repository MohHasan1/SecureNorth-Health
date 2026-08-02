import type { DecryptResult } from "@/components/portal/BehindTheScenesPanel";

type DecryptedFields = {
  patientName: DecryptResult;
  dateOfBirth: DecryptResult;
  diagnosisNotes: DecryptResult;
};

// Deliberately friendlier/more specific wording than the records-list
// version (decryptResultText). This is the full-page view, room for a
// real sentence instead of a one-word list-row label.
function fieldText(result: DecryptResult, fallback: string) {
  if (result.restricted) return "You don't have access to this record.";
  if ("tampered" in result) return "This record couldn't be verified. Contact IT.";
  return result.plaintext || fallback;
}

// The ordinary, realistic view of a patient record: what a nurse or
// doctor actually sees day to day. No ciphertext, no crypto internals.
// That's the admin-only BehindTheScenesPanel instead.
export function PatientRecordView({
  recordId,
  decrypted,
}: {
  recordId: string;
  decrypted: DecryptedFields;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted">Patient record #{recordId}</p>
        <h1 className="mt-1 text-2xl font-semibold">
          {fieldText(decrypted.patientName, "Unknown patient")}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Date of birth: {fieldText(decrypted.dateOfBirth, "N/A")}
        </p>
      </div>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="font-medium">Diagnosis notes</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
          {fieldText(decrypted.diagnosisNotes, "No notes on file.")}
        </p>
      </section>
    </div>
  );
}
