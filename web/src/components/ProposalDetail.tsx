"use client";

import { useParams } from "next/navigation";
import { useProposal } from "@/hooks/useSubgraph";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { useVotingPower } from "@/hooks/useGovToken";
import { StateBadge, formatCompact, formatUnitsRaw, shortAddress } from "@/lib/format";
import { governorAbi } from "@/lib/abis";
import { config, isZeroAddress } from "@/lib/config";
import { CommentSection } from "./CommentSection";

const governorAddress = config.governorAddress as `0x${string}`;

export function ProposalDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: proposal, isLoading, isError } = useProposal(id);

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-slate-500">Loading proposal…</div>;
  }
  if (isError || !proposal) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-5 text-sm text-red-400">
        Proposal not found or subgraph not configured.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-white">
              {proposal.title ?? `Proposal #${proposal.id}`}
            </h1>
            <StateBadge state={proposal.state} />
          </div>
          <p className="text-sm text-slate-500">
            by {shortAddress(proposal.proposer)} · voting window block {proposal.startBlock} →{" "}
            {proposal.endBlock}
          </p>
        </div>

        <VoteTally
          forV={proposal.votesFor}
          againstV={proposal.votesAgainst}
          abstainV={proposal.votesAbstain}
        />

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-2 text-sm font-semibold text-slate-300">Description</h2>
          <p className="whitespace-pre-wrap text-sm text-slate-400">
            {proposal.description || "No description pinned yet."}
          </p>
        </section>

        {proposal.votes && proposal.votes.length > 0 && (
          <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-300">Votes</h2>
            <div className="space-y-2 text-sm">
              {proposal.votes.map((v) => (
                <div key={v.id} className="flex items-center justify-between border-b border-slate-800 pb-2 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-300">{shortAddress(v.voter)}</span>
                    {v.reason && <span className="text-xs text-slate-500">“{v.reason}”</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{formatCompact(v.weight)}</span>
                    <SupportBadge support={v.support} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <CommentSection proposalId={Number(proposal.id)} />
      </div>

      <VotePanel proposalId={proposal.id} state={proposal.state} />
    </div>
  );
}

function VoteTally({ forV, againstV, abstainV }: { forV: string; againstV: string; abstainV: string }) {
  const f = Number(BigInt(forV ?? 0));
  const a = Number(BigInt(againstV ?? 0));
  const ab = Number(BigInt(abstainV ?? 0));
  const total = f + a + ab;
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
      <div className="mb-3 flex h-3 w-full overflow-hidden rounded-full">
        <div className="bg-emerald-500" style={{ width: `${total ? (f / total) * 100 : 0}%` }} />
        <div className="bg-red-500" style={{ width: `${total ? (a / total) * 100 : 0}%` }} />
        <div className="bg-slate-500" style={{ width: `${total ? (ab / total) * 100 : 0}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div>
          <p className="text-lg font-semibold text-emerald-400">{formatCompact(forV)}</p>
          <p className="text-xs text-slate-500">For</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-red-400">{formatCompact(againstV)}</p>
          <p className="text-xs text-slate-500">Against</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-300">{formatCompact(abstainV)}</p>
          <p className="text-xs text-slate-500">Abstain</p>
        </div>
      </div>
    </section>
  );
}

function SupportBadge({ support }: { support: number }) {
  const label = support === 1 ? "For" : support === 0 ? "Against" : "Abstain";
  const cls =
    support === 1
      ? "bg-emerald-500/15 text-emerald-400"
      : support === 0
        ? "bg-red-500/15 text-red-400"
        : "bg-slate-500/15 text-slate-400";
  return <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}

function VotePanel({ proposalId, state }: { proposalId: string; state: string }) {
  const { isConnected, address } = useAccount();
  const { data: votingPower } = useVotingPower();
  const { writeContract, isPending } = useWriteContract();
  const { data: hasVoted } = useReadContract({
    abi: governorAbi,
    address: governorAddress,
    functionName: "hasVoted",
    args: address && !isZeroAddress(config.governorAddress) ? [BigInt(proposalId), address] : undefined,
    query: {
      enabled: isConnected && !!address && !isZeroAddress(config.governorAddress),
    },
  });

  const canVote = isConnected && state === "Active" && !hasVoted;

  const cast = (support: number) => {
    if (!address || isZeroAddress(config.governorAddress)) return;
    writeContract({
      abi: governorAbi,
      address: governorAddress,
      functionName: "castVote",
      args: [BigInt(proposalId), support],
    });
  };

  return (
    <aside className="h-fit rounded-lg border border-slate-800 bg-slate-900 p-5 lg:sticky lg:top-24">
      <p className="text-sm text-slate-400">Your voting power</p>
      <p className="mt-1 text-2xl font-semibold text-white">
        {isConnected ? formatUnitsRaw(votingPower) : "—"}
      </p>

      <div className="mt-4 space-y-2">
        {!isConnected && (
          <p className="text-xs text-slate-500">Connect a wallet to vote.</p>
        )}
        {isConnected && hasVoted && (
          <p className="text-xs text-slate-500">You have already voted on this proposal.</p>
        )}
        {isConnected && state !== "Active" && (
          <p className="text-xs text-slate-500">Voting is closed for this proposal.</p>
        )}
        {canVote && (
          <>
            <button
              onClick={() => cast(1)}
              disabled={isPending}
              className="w-full rounded-lg bg-emerald-500 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
            >
              {isPending ? "Casting…" : "For"}
            </button>
            <button
              onClick={() => cast(0)}
              disabled={isPending}
              className="w-full rounded-lg bg-red-500 py-2 text-sm font-medium text-slate-950 hover:bg-red-400 disabled:opacity-50"
            >
              Against
            </button>
            <button
              onClick={() => cast(2)}
              disabled={isPending}
              className="w-full rounded-lg border border-slate-600 py-2 text-sm font-medium text-slate-300 hover:border-slate-400 disabled:opacity-50"
            >
              Abstain
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
