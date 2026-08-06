"use client";

import { useState } from "react";
import Link from "next/link";
import { PROPOSAL_STATES } from "@/lib/format";
import { ProposalList } from "./ProposalList";

export function ProposalsPage() {
  const [state, setState] = useState<string | undefined>(undefined);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Proposals</h1>
        <Link
          href="/proposals/new"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400"
        >
          + Create proposal
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip label="All" active={state === undefined} onClick={() => setState(undefined)} />
        {PROPOSAL_STATES.map((s) => (
          <FilterChip key={s} label={s} active={state === s} onClick={() => setState(s)} />
        ))}
      </div>

      <ProposalList state={state} />
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
          : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500"
      }`}
    >
      {label}
    </button>
  );
}
