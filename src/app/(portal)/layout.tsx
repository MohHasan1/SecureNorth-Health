import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";

import { LogoutButton } from "@/components/portal/LogoutButton";
import { getCurrentUser } from "@/lib/getCurrentUser";

import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SecureNorth Health Portal",
  description: "Patient intake demo, encryption at rest and in transit",
};

const ROLE_LABEL: Record<string, string> = {
  nurse: "Nurse",
  doctor: "Doctor",
  admin: "Admin",
};

export default async function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-foreground">
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-6">
              <Link href={user ? "/records" : "/login"} className="font-semibold tracking-tight">
                SecureNorth Health <span className="text-muted font-normal">· Portal</span>
              </Link>
              <nav className="flex items-center gap-4 text-sm text-muted">
                {user ? (
                  <>
                    <Link href="/records" className="hover:text-foreground">
                      Records
                    </Link>
                    <Link href="/intake" className="hover:text-foreground">
                      New record
                    </Link>
                    {user.role === "admin" ? (
                      <Link href="/admin-tools/seed" className="hover:text-foreground">
                        Seed data
                      </Link>
                    ) : null}
                  </>
                ) : null}
              </nav>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/help"
                className="flex items-center gap-1.5 rounded-full border border-primary bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:bg-primary-hover"
              >
                <span aria-hidden>❓</span> Help
              </Link>
              {user ? (
                <>
                  <span className="text-muted">
                    {user.name} · {ROLE_LABEL[user.role as string] ?? user.role}
                  </span>
                  <LogoutButton />
                </>
              ) : null}
            </div>
          </div>
        </header>
        <main className="flex-1">
          <div className="mx-auto max-w-3xl px-6 py-10">{children}</div>
        </main>
      </body>
    </html>
  );
}
