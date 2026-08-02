"use client";

import { useState } from "react";

import { runSeed } from "@/lib/actions/runSeed";

export function SeedRunner() {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const result = await runSeed();
      setLog(result);
    } catch {
      setError("Seed failed. Check server logs.");
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
        className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:cursor-default disabled:opacity-50"
      >
        {loading ? "Seeding…" : "Seed demo data"}
      </button>

      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

      {log ? (
        <pre className="mt-4 overflow-x-auto rounded border border-border bg-restricted-bg p-3 text-xs text-foreground">
          {log.join("\n")}
        </pre>
      ) : null}
    </div>
  );
}
