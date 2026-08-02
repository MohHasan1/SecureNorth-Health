import Link from "next/link";

const ACCOUNTS = [
  { role: "Nurse", email: "nurse@securenorth.health", password: "nurse-demo-pass" },
  { role: "Nurse 2", email: "nurse2@securenorth.health", password: "nurse2-demo-pass" },
  { role: "Provider", email: "provider@securenorth.health", password: "provider-demo-pass" },
  { role: "Admin", email: "admin@securenorth.health", password: "admin-demo-pass" },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-xl font-semibold">What is this?</h1>
        <p className="mt-2 text-sm text-foreground">
          This is a demo hospital app. It shows how patient records are kept private — even if
          someone steals the database, they still can&apos;t read what&apos;s in it.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold">How to use it</h2>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-foreground">
          <li>Sign in with one of the demo accounts below.</li>
          <li>Add a new patient, or look at the ones already there.</li>
          <li>
            Try signing in as different people — a nurse, a doctor, an admin — and see how much
            each one is allowed to see.
          </li>
        </ol>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Demo accounts</h2>
        <ul className="mt-2 divide-y divide-border rounded-lg border border-border bg-surface">
          {ACCOUNTS.map((account) => (
            <li key={account.email} className="px-4 py-2.5 text-sm">
              <span className="font-medium text-foreground">{account.role}</span>
              <div className="mt-0.5 text-muted">
                {account.email} · {account.password}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold">Want to see it like a hacker would?</h2>
        <p className="mt-2 text-sm text-muted">
          There&apos;s a separate page that shows what someone would see if they broke into the
          database directly, without a login.
        </p>
        <Link
          href="/pwned"
          className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Go to the hacker view →
        </Link>
      </div>
    </div>
  );
}
