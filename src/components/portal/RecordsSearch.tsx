"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Row = {
  id: string;
  patientName: string;
  dateOfBirth: string;
  createdAt: string;
};

export function RecordsSearch({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => row.patientName.toLowerCase().includes(q));
  }, [rows, query]);

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search patient name…"
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
      />

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No matching patients.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-surface">
          {filtered.map((row) => (
            <li key={row.id}>
              <Link
                href={`/records/${row.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm hover:bg-bg"
              >
                <span>
                  <span className="font-medium text-foreground">{row.patientName}</span>
                  <span className="ml-2 text-muted">DOB {row.dateOfBirth}</span>
                </span>
                <span className="shrink-0 text-muted">
                  {new Date(row.createdAt).toLocaleDateString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
