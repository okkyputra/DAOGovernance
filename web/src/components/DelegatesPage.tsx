"use client";

import { useState } from "react";
import { useDelegates } from "@/hooks/useSubgraph";
import { formatCompact, shortAddress } from "@/lib/format";
import { useWriteContract } from "wagmi";
import { govTokenAbi } from "@/lib/abis";
import { config, isZeroAddress } from "@/lib/config";

const tokenAddress = config.govTokenAddress as `0x${string}`;

export function DelegatesPage() {
  const { data: delegates, isLoading, isError } = useDelegates();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-white">Delegates</h1>

      {isLoading && <p className="py-8 text-center text-sm text-slate-500">Loading delegates…</p>}
      {isError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-5 text-sm text-red-400">
          Failed to load delegates from subgraph.
        </div>
      )}
      {delegates && delegates.length === 0 && (
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
          No delegates yet. Holders who self-delegate appear here.
        </div>
      )}

      {delegates && delegates.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Delegate</th>
                <th className="px-4 py-3">Voting power</th>
                <th className="px-4 py-3">Delegators</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950">
              {delegates.map((d) => (
                <DelegateRow key={d.id} address={d.id} votingPower={d.votingPower} delegators={d.delegatorCount} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DelegateRow({
  address,
  votingPower,
  delegators,
}: {
  address: string;
  votingPower: string;
  delegators: number;
}) {
  const { writeContract, isPending } = useWriteContract();
  const [done, setDone] = useState(false);

  const delegate = () => {
    if (isZeroAddress(config.govTokenAddress)) return;
    writeContract(
      {
        abi: govTokenAbi,
        address: tokenAddress,
        functionName: "delegate",
        args: [address as `0x${string}`],
      },
      {
        onSuccess: () => setDone(true),
      }
    );
  };

  return (
    <tr>
      <td className="px-4 py-3 font-mono text-xs text-slate-300">{shortAddress(address)}</td>
      <td className="px-4 py-3 font-medium text-white">{formatCompact(votingPower)}</td>
      <td className="px-4 py-3 text-slate-400">{delegators}</td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={delegate}
          disabled={isPending || done || isZeroAddress(config.govTokenAddress)}
          className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-slate-700 disabled:opacity-40"
        >
          {done ? "Delegated ✓" : isPending ? "Delegating…" : "Delegate to this address"}
        </button>
      </td>
    </tr>
  );
}
