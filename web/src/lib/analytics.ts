import type { ProposalEntity, VoteEntity } from "./subgraph";

export interface Analytics {
  totalProposals: number;
  activeCount: number;
  passedCount: number;
  defeatedCount: number;
  passRate: number | null;
  totalVotesCast: number;
  avgParticipation: number | null;
  supportBreakdown: { for: number; against: number; abstain: number };
  topDelegates: { address: string; votingPower: number }[];
}

export interface ProposalWithVotes extends ProposalEntity {
  votes: VoteEntity[];
}

export function computeAnalytics(
  proposals: ProposalEntity[],
  delegated?: { id: string; votingPower: string }[]
): Analytics {
  const total = proposals.length;
  const passedStates = ["Succeeded", "Queued", "Executed"];
  const decided = proposals.filter((p) => passedStates.includes(p.state) || p.state === "Defeated");
  const passedCount = proposals.filter((p) => passedStates.includes(p.state)).length;
  const defeatedCount = proposals.filter((p) => p.state === "Defeated").length;

  const supportBreakdown = { for: 0, against: 0, abstain: 0 };
  const tally = (key: "votesFor" | "votesAgainst" | "votesAbstain") =>
    proposals.reduce((sum, p) => sum + Number(BigInt(p[key] ?? 0)), 0);
  supportBreakdown.for = tally("votesFor");
  supportBreakdown.against = tally("votesAgainst");
  supportBreakdown.abstain = tally("votesAbstain");

  const totalVotesCast = supportBreakdown.for + supportBreakdown.against + supportBreakdown.abstain;

  const avgParticipation =
    total > 0 ? Math.round((totalVotesCast / total / 1e18) * 100) / 100 : null;

  const topDelegates = (delegated ?? [])
    .map((d) => ({ address: d.id, votingPower: Number(BigInt(d.votingPower)) / 1e18 }))
    .filter((d) => d.votingPower > 0)
    .sort((a, b) => b.votingPower - a.votingPower)
    .slice(0, 5);

  return {
    totalProposals: total,
    activeCount: proposals.filter((p) => p.state === "Active").length,
    passedCount,
    defeatedCount,
    passRate: decided.length > 0 ? Math.round((passedCount / decided.length) * 100) : null,
    totalVotesCast,
    avgParticipation,
    supportBreakdown,
    topDelegates,
  };
}
