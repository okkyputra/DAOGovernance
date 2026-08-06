"use client";

import { useProposals } from "@/hooks/useSubgraph";
import { VotingPowerCard } from "./VotingPowerCard";

export function StatCards() {
  const { data } = useProposals();
  const total = data?.length ?? null;
  const active = data?.filter((p) => p.state === "Active").length ?? null;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <VotingPowerCard />
      <StatCard label="Total proposals" value={total === null ? "—" : total} />
      <StatCard label="Active proposals" value={active === null ? "—" : active} />
      <StatCard label="Queued / Executed" value={total === null ? "—" : data!.filter((p) => p.state === "Queued" || p.state === "Executed").length} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}
