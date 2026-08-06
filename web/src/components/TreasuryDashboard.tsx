"use client";

import { useTreasuryEthBalance, useTreasuryGovBalance } from "@/hooks/useTreasury";
import { useProposals } from "@/hooks/useSubgraph";
import { formatUnitsRaw, formatCompact } from "@/lib/format";
import { config, isZeroAddress } from "@/lib/config";

export function TreasuryDashboard() {
  const { data: eth } = useTreasuryEthBalance();
  const { data: gov } = useTreasuryGovBalance();
  const { data: proposals } = useProposals();

  const treasuryAddr = config.treasuryAddress;

  if (isZeroAddress(treasuryAddr)) {
    return (
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-5 text-sm text-amber-400">
        Treasury address not configured — set NEXT_PUBLIC_TREASURY_ADDRESS to show balances.
      </div>
    );
  }

  const outflows = (proposals ?? []).filter((p) => p.state === "Executed" && p.values && p.values.some((v) => Number(BigInt(v)) > 0n));
  const totalOutflow = outflows.reduce((s, p) => s + (p.values ?? []).reduce((a, v) => a + Number(BigInt(v)), 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <BalanceCard label="ETH" value={eth ? eth.formatted : "—"} symbol="ETH" />
        <BalanceCard label="GOV" value={formatUnitsRaw(gov)} symbol="GOV" />
        <BalanceCard
          label="Total ETH outflow (executed)"
          value={`${(totalOutflow / 1e18).toFixed(2)}`}
          symbol="ETH"
        />
      </div>

      <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-300">Related proposals</h2>
        {outflows.length === 0 ? (
          <p className="text-xs text-slate-500">No executed treasury proposals yet.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {outflows.map((p) => (
              <a key={p.id} href={`/proposals/${p.id}`} className="block rounded-lg border border-slate-800 bg-slate-950 p-3 hover:border-slate-600">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{p.title ?? `#${p.id}`}</span>
                  <span className="text-xs text-emerald-400">{formatCompact(p.values?.[0] ?? "0")} ETH</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function BalanceCard({ label, value, symbol }: { label: string; value: string; symbol: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">
        {value} <span className="text-base font-normal text-slate-500">{symbol}</span>
      </p>
    </div>
  );
}
