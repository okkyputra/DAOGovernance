export const PROPOSAL_STATES = [
  "Pending",
  "Active",
  "Canceled",
  "Defeated",
  "Succeeded",
  "Queued",
  "Expired",
  "Executed",
] as const;

export type ProposalState = (typeof PROPOSAL_STATES)[number];

const stateColor: Record<string, string> = {
  Active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Succeeded: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Queued: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Defeated: "bg-red-500/15 text-red-400 border-red-500/30",
  Canceled: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  Expired: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  Executed: "bg-sky-500/15 text-sky-400 border-sky-500/30",
};

export function StateBadge({ state }: { state: string }) {
  const color = stateColor[state] ?? stateColor.Canceled;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {state}
    </span>
  );
}

export function formatUnitsRaw(value: string | bigint | undefined, decimals = 18): string {
  if (value === undefined || value === null) return "—";
  const big = typeof value === "bigint" ? value : BigInt(value);
  const neg = big < 0n;
  const abs = neg ? -big : big;
  const s = abs.toString().padStart(decimals + 1, "0");
  const intPart = s.slice(0, -decimals) || "0";
  const fracPart = s.slice(-decimals).replace(/0+$/, "").slice(0, 4);
  const out = fracPart ? `${intPart}.${fracPart}` : intPart;
  return `${neg ? "-" : ""}${out}`;
}

export function formatCompact(value: string | bigint | undefined): string {
  if (value === undefined || value === null) return "—";
  const big = typeof value === "bigint" ? value : BigInt(value);
  const units = formatUnitsRaw(big, 18);
  const n = Number(units);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}k`;
  return units;
}

export function shortAddress(addr: string | undefined): string {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function relativeTime(createdAt: string): string {
  const secs = Math.floor(Date.now() / 1000) - Number(createdAt);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}
