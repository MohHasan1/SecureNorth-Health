import { LogoutButton } from "@/components/portal/LogoutButton";

// Native <details>/<summary>: click to open, click outside to close, no
// client-side state needed for the toggle itself.
export function ProfileMenu({
  name,
  email,
  roleLabel,
}: {
  name: string;
  email: string;
  roleLabel: string;
}) {
  return (
    <details className="group relative">
      <summary className="cursor-pointer list-none text-sm text-muted hover:text-foreground [&::-webkit-details-marker]:hidden">
        {name}
      </summary>
      <div className="absolute right-0 top-full z-10 mt-2 w-56 rounded-md border border-border bg-surface p-4 shadow-lg">
        <p className="font-medium text-foreground">{name}</p>
        <p className="mt-0.5 text-xs text-muted">{email}</p>
        <p className="mt-0.5 text-xs text-muted">{roleLabel}</p>
        <div className="mt-3 border-t border-border pt-3">
          <LogoutButton />
        </div>
      </div>
    </details>
  );
}
