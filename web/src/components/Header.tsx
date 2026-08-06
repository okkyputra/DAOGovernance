"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {

  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">
          DAO Governance
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-6 text-sm text-slate-400 sm:flex">
            <Link href="/" className="hover:text-white">Dashboard</Link>
            <Link href="/proposals" className="hover:text-white">Proposals</Link>
            <Link href="/delegates" className="hover:text-white">Delegates</Link>
            <Link href="/treasury" className="hover:text-white">Treasury</Link>
            <Link href="/analytics" className="hover:text-white">Analytics</Link>
          </nav>
          <ConnectButton showBalance={false} />
        </div>
      </div>
    </header>
  );
}
