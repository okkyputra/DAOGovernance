"use client";

import Link from "next/link";
import { useProposals } from "@/hooks/useSubgraph";
import { StateBadge, formatCompact, relativeTime } from "@/lib/format";
import { contractsDeployed } from "@/lib/config";
function VoteBar({ forV, againstV, abstainV }: { forV: string; againstV: string; abstainV: string }) {
  const f = Number(BigInt(forV ?? 0));
  const a = Number(BigInt(againstV ?? 0));
  const ab = Number(BigInt(abstainV ?? 0));
  const total = f + a + ab;
  if (total === 0) return <div className="h-1.5 w-full rounded-full bg-slate-800" />;
  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full">
      <div className="bg-emerald-500" style={{ width: `${(f / total) * 100}%` }} />
      <div className="bg-red-500" style={{ width: `${(a / total) * 100}%` }} />
      <div className="bg-slate-500" style={{ width: `${(ab / total) * 100}%` }} />
    </div>
  );
}

export function ProposalList({ state }: { state?: string }) {
  const { data: proposals, isLoading, isError } = useProposals(state);

  if (!contractsDeployed() && proposals?.length === 0) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
        Contracts not deployed yet — set NEXT_PUBLIC_GOVERNOR_ADDRESS etc. and a deployed subgraph URL to see live
        proposals.
      </div>
    );
  }

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-slate-500">Loading proposals…</div>;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-5 text-sm text-red-400">
        Failed to load proposals from subgraph. Is NEXT_PUBLIC_SUBGRAPH_URL configured and deployed?
      </div>
    );
  }

  if (!proposals || proposals.length === 0) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
        No proposals yet. Connect a wallet to create the first one.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {proposals.map((p) => (
        <Link
          key={p.id}
          href={`/proposals/${p.id}`}
          className="block rounded-lg border border-slate-800 bg-slate-900 p-5 transition-colors hover:border-slate-600"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-white">
                {p.title ?? `Proposal #${p.id}`}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                by {p.proposer.slice(0, 6)}…{p.proposer.slice(-4)} · {relativeTime(p.createdAt)}
              </p>
            </div>
            <StateBadge state={p.state} />
          </div>
          <div className="mt-4 space-y-2">
            <VoteBar forV={p.votesFor} againstV={p.votesAgainst} abstainV={p.votesAbstain} />
            <div className="flex gap-4 text-xs text-slate-400">
              <span className="text-emerald-400">{formatCompact(p.votesFor)} For</span>
              <span className="text-red-400">{formatCompact(p.votesAgainst)} Against</span>
              <span className="text-slate-500">{formatCompact(p.votesAbstain)} Abstain</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
