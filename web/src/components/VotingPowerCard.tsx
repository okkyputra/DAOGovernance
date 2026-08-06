"use client";

import { useAccount } from "wagmi";
import { useTokenBalance, useVotingPower } from "@/hooks/useGovToken";
import { formatCompact } from "@/lib/format";
import { config, isZeroAddress } from "@/lib/config";

export function VotingPowerCard() {
  const { isConnected, address } = useAccount();
  const { data: balance } = useTokenBalance();
  const { data: votes } = useVotingPower();

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">Voting power</p>
      <p className="mt-1 text-2xl font-semibold text-white">
        {isConnected ? formatCompact(votes) : "—"}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {isConnected && address ? `${formatCompact(balance)} GOV held` : "Connect a wallet"}
      </p>
    </div>
  );
}

export function NotDeployedNotice() {
  if (!isZeroAddress(config.govTokenAddress)) return null;
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-400">
      Contract addresses not configured — set NEXT_PUBLIC_GOVTOKEN_ADDRESS to show live balances.
    </div>
  );
}
