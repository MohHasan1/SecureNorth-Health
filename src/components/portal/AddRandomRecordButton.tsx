"use client";

import { useState } from "react";

import { addRandomPatientRecord } from "@/lib/actions/addRandomPatientRecord";

export function AddRandomRecordButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const result = await addRandomPatientRecord();
      setMessage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create record.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="cursor-pointer rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-bg disabled:cursor-default disabled:opacity-50"
      >
        {loading ? "Adding…" : "+ Add random patient record"}
      </button>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
    </div>
  );
}
