"use client";

import { useProposals, useDelegates } from "@/hooks/useSubgraph";
import { computeAnalytics } from "@/lib/analytics";
import { shortAddress } from "@/lib/format";

export function AnalyticsDashboard() {
  const { data: proposals } = useProposals();
  const { data: delegates } = useDelegates();

  if (!proposals) {
    return <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-sm text-slate-500">Loading analytics…</div>;
  }

  const a = computeAnalytics(proposals, delegates);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Total proposals" value={a.totalProposals} />
        <Card label="Pass rate" value={a.passRate === null ? "—" : `${a.passRate}%`} />
        <Card label="Passed" value={a.passedCount} />
        <Card label="Defeated" value={a.defeatedCount} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-300">Support breakdown</h2>
          {a.totalVotesCast === 0 ? (
            <p className="text-xs text-slate-500">No votes cast yet.</p>
          ) : (
            <SupportBar
              forV={a.supportBreakdown.for}
              againstV={a.supportBreakdown.against}
              abstainV={a.supportBreakdown.abstain}
            />
          )}
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-300">Top delegates</h2>
          {a.topDelegates.length === 0 ? (
            <p className="text-xs text-slate-500">No delegates yet.</p>
          ) : (
            <div className="space-y-2 text-sm">
              {a.topDelegates.map((d, i) => (
                <div key={d.address} className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <span className="w-5 text-slate-500">#{i + 1}</span>
                    <span className="font-mono text-xs text-slate-300">{shortAddress(d.address)}</span>
                  </span>
                  <span className="font-medium text-white">{d.votingPower.toLocaleString()} GOV</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function SupportBar({ forV, againstV, abstainV }: { forV: number; againstV: number; abstainV: number }) {
  const total = forV + againstV + abstainV;
  return (
    <div>
      <div className="mb-3 flex h-3 w-full overflow-hidden rounded-full">
        <div className="bg-emerald-500" style={{ width: `${(forV / total) * 100}%` }} />
        <div className="bg-red-500" style={{ width: `${(againstV / total) * 100}%` }} />
        <div className="bg-slate-500" style={{ width: `${(abstainV / total) * 100}%` }} />
      </div>
      <div className="grid grid-cols-3 text-center text-xs text-slate-400">
        <span className="text-emerald-400">{(forV / 1e18).toFixed(1)} For</span>
        <span className="text-red-400">{(againstV / 1e18).toFixed(1)} Against</span>
        <span>{(abstainV / 1e18).toFixed(1)} Abstain</span>
      </div>
    </div>
  );
}
