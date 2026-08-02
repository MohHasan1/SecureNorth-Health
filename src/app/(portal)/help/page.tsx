import Link from "next/link";

const ACCOUNTS = [
  { role: "Nurse", email: "nurse@securenorth.health", password: "nurse-demo-pass" },
  { role: "Nurse 2", email: "nurse2@securenorth.health", password: "nurse2-demo-pass" },
  { role: "Doctor", email: "doctor@securenorth.health", password: "doctor-demo-pass" },
  { role: "Admin", email: "admin@securenorth.health", password: "admin-demo-pass" },
];

const ROLES = [
  {
    role: "Nurse",
    canSee: "Only the patients they personally added.",
  },
  {
    role: "Doctor",
    canSee: "Every patient in the system, not just their own.",
  },
  {
    role: "Admin",
    canSee: "Every patient, plus can add test data, edit records, and delete records.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-xl font-semibold">What is this?</h1>
        <p className="mt-2 text-sm text-foreground">
          This is a demo hospital app. It shows how patient records are kept private. Even if
          someone steals the database, they still can&apos;t read what&apos;s in it.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold">How to use it</h2>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-foreground">
          <li>Sign in with one of the demo accounts below.</li>
          <li>Add a new patient, or look at the ones already there.</li>
          <li>
            Try signing in as different people (a nurse, a doctor, an admin) and see how much
            each one is allowed to see.
          </li>
          <li>
            Then check out the{" "}
            <Link href="/pwned" className="text-primary underline">
              hacker view
            </Link>{" "}
            to see what someone would find if they broke into the database directly (spoiler:
            nothing readable). More on that below.
          </li>
        </ol>
      </div>

      <div>
        <h2 className="text-lg font-semibold">What can each role see?</h2>
        <ul className="mt-2 divide-y divide-border rounded-lg border border-border bg-surface">
          {ROLES.map((r) => (
            <li key={r.role} className="px-4 py-2.5 text-sm">
              <span className="font-medium text-foreground">{r.role}</span>
              <div className="mt-0.5 text-muted">{r.canSee}</div>
            </li>
          ))}
        </ul>
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
          There&apos;s a separate page, with no login at all, that shows what someone would see
          if they broke into the database directly. It looks like a hacker&apos;s screen: dark
          background, green text. You can see every patient record, but all you get is scrambled
          text, not real names or notes. You can even try to edit the scrambled text yourself,
          but it still won&apos;t turn into anything readable. That&apos;s the whole point: even
          with full access to the database, the data stays private.
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
