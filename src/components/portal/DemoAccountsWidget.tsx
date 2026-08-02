"use client";

import { useRef, useState } from "react";

const DEMO_ACCOUNTS = [
  { role: "Nurse", email: "nurse@securenorth.health", password: "nurse-demo-pass" },
  { role: "Nurse 2", email: "nurse2@securenorth.health", password: "nurse2-demo-pass" },
  { role: "Provider", email: "provider@securenorth.health", password: "provider-demo-pass" },
  { role: "Admin", email: "admin@securenorth.health", password: "admin-demo-pass" },
] as const;

type Account = (typeof DEMO_ACCOUNTS)[number];

// A fixed-position dev tool, not a page element — drag it anywhere by its
// handle, click (without dragging) to pop the panel open.
export function DemoAccountsWidget({ onSelect }: { onSelect: (account: Account) => void }) {
  const [offset, setOffset] = useState({ right: 24, bottom: 24 });
  const [open, setOpen] = useState(false);
  const drag = useRef<{
    startX: number;
    startY: number;
    origRight: number;
    origBottom: number;
    moved: boolean;
  } | null>(null);

  function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      origRight: offset.right,
      origBottom: offset.bottom,
      moved: false,
    };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) drag.current.moved = true;
    setOffset({
      right: drag.current.origRight - dx,
      bottom: drag.current.origBottom - dy,
    });
  }

  function handlePointerUp() {
    if (drag.current && !drag.current.moved) setOpen((v) => !v);
    drag.current = null;
  }

  function handleSelect(account: Account) {
    onSelect(account);
    setOpen(false);
  }

  return (
    <div
      className="fixed z-50 select-none"
      style={{ right: offset.right, bottom: offset.bottom }}
    >
      {open ? (
        <div className="absolute bottom-full right-0 mb-3 w-64 overflow-hidden rounded-md border border-green-500/40 bg-black font-mono shadow-[0_0_30px_rgba(34,197,94,0.35)]">
          <div className="flex items-center gap-1.5 border-b border-green-500/20 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-red-500/70" />
            <span className="h-2 w-2 rounded-full bg-yellow-500/70" />
            <span className="h-2 w-2 rounded-full bg-green-500/70" />
            <span className="ml-1.5 text-[10px] text-green-500/60">root@securenorth:~#</span>
          </div>
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => handleSelect(account)}
              className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-green-500/10"
            >
              <span className="text-green-600">$</span>
              <span className="flex flex-col">
                <span className="text-xs text-green-400">
                  login --role={account.role.toLowerCase()}
                </span>
                <span className="text-[11px] text-green-600/70">{account.email}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex cursor-grab items-center gap-1.5 rounded-full border border-green-500/40 bg-black px-3 py-2 font-mono text-xs text-green-400 shadow-[0_0_14px_rgba(34,197,94,0.4)] active:cursor-grabbing"
      >
        <span className="text-green-600">⠿</span>
        <span className="text-green-500">&gt;_</span> demo_accounts
      </button>
    </div>
  );
}
