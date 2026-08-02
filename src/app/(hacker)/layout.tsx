import type { Metadata } from "next";

import "../globals.css";

export const metadata: Metadata = {
  title: "unauthorized_access.sh",
};

// Deliberately its own root layout, separate from the (portal) group. No
// shared header, no login chrome. This route simulates an attacker who
// bypassed the app entirely (e.g. via the misconfigured cloud storage
// bucket from the brief), not someone using the portal.
export default function HackerLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-black font-mono text-green-400 antialiased">{children}</body>
    </html>
  );
}
