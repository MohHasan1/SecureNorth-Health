import { redirect } from "next/navigation";

import { LoginForm } from "@/components/portal/LoginForm";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/records");

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-xl font-semibold">Staff sign in</h1>
      <div className="mt-6">
        <LoginForm />
      </div>
    </div>
  );
}
