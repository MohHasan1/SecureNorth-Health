import Link from "next/link";

const SKULL = String.raw`
        uuuuuuu
    uu$$$$$$$$$$$uu
 uu$$$$$$$$$$$$$$$$$uu
u$$$$$$$$$$$$$$$$$$$$$u
u$$$$$$$$$$$$$$$$$$$$$$$u
u$$$$$$$$$$$$$$$$$$$$$$$u
u$$$$$$"   "$$$"   "$$$$$$u
"$$$$"      u$u       $$$$"
 $$$u       u$u       u$$$
  $$$u     u$$$u     u$$$
   "$$$$uu$$$   $$$uu$$$$"
     "$$$$$$$"   "$$$$$$$"
      u$$$$$$$u$$$$$$$u
       u$"$"$"$"$"$"$u
uuu    "$u$ $ $ $ $u$"    uuu
u$$$$     $$$u$u$u$$$     $$$$u
$$$$$     $$$$$$$$$$$     $$$$$
$$$$$     $$$$$$$$$$$     $$$$$
`;

export default function PwnedPage() {
  return (
    <div className="scanlines relative flex min-h-full flex-col items-center justify-center gap-6 overflow-hidden px-6 py-16 text-center">
      <pre className="text-[10px] leading-[1.1] text-green-500/80 sm:text-xs">{SKULL}</pre>

      <h1 className="glitch-text text-2xl font-bold tracking-widest text-green-400 sm:text-4xl">
        SYSTEM COMPROMISED
      </h1>

      <p className="max-w-md text-sm text-green-500">
        securenorth-backups/patient-db is exposed. read/write access obtained via misconfigured
        cloud storage permissions.
      </p>

      <p className="max-w-md text-xs text-green-600">
        (relax, this is a course demo. the only thing behind this door is AES-256-GCM
        ciphertext, and there's no key back here.)
      </p>

      <Link
        href="/breach"
        className="mt-4 border border-green-500/60 px-6 py-2 font-mono text-sm text-green-300 hover:bg-green-500/10"
      >
        &gt;_ ACCESS DATABASE
      </Link>

      <span className="animate-pulse text-green-600">_</span>
    </div>
  );
}
