"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function EditRecordForm({
  recordId,
  initialPatientName,
  initialDateOfBirth,
  initialDiagnosisNotes,
}: {
  recordId: string;
  initialPatientName: string;
  initialDateOfBirth: string;
  initialDiagnosisNotes: string;
}) {
  const router = useRouter();
  const [patientName, setPatientName] = useState(initialPatientName);
  const [dateOfBirth, setDateOfBirth] = useState(initialDateOfBirth);
  const [diagnosisNotes, setDiagnosisNotes] = useState(initialDiagnosisNotes);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Same real REST endpoint the intake form POSTs to. A PATCH here goes
    // through PatientRecords' beforeChange hook exactly like a create
    // does, so the edited plaintext gets encrypted fresh with a new IV.
    const res = await fetch(`/api/patient-records/${recordId}?depth=0`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientName, dateOfBirth, diagnosisNotes }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Could not save. Are you still signed in as admin?");
      return;
    }

    router.push(`/records/${recordId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="patientName" className="block text-sm font-medium text-foreground">
          Patient name
        </label>
        <input
          id="patientName"
          required
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-foreground">
          Date of birth
        </label>
        <input
          id="dateOfBirth"
          type="date"
          required
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="diagnosisNotes" className="block text-sm font-medium text-foreground">
          Diagnosis notes
        </label>
        <textarea
          id="diagnosisNotes"
          required
          rows={4}
          value={diagnosisNotes}
          onChange={(e) => setDiagnosisNotes(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
