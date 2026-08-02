import { redirect } from "next/navigation";

import { IntakeForm } from "@/components/portal/IntakeForm";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function IntakePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-xl font-semibold">New patient record</h1>
      <p className="mt-1 text-sm text-muted">
        Whatever you enter here is encrypted (AES-256-GCM) before it's written to disk.
      </p>
      <div className="mt-6">
        <IntakeForm />
      </div>
    </div>
  );
}
