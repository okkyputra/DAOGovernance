import { config } from "./config";

export interface ProposalEntity {
  id: string;
  proposer: string;
  title: string | null;
  description: string | null;
  startBlock: string;
  endBlock: string;
  state: string;
  votesFor: string;
  votesAgainst: string;
  votesAbstain: string;
  createdAt: string;
}

export interface VoteEntity {
  id: string;
  proposal: { id: string };
  voter: string;
  support: number;
  weight: string;
  reason: string | null;
}

export interface DelegateEntity {
  id: string;
  votingPower: string;
  delegatorCount: number;
}

interface GraphResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

async function graph<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  if (!config.subgraphUrl) {
    throw new Error("NEXT_PUBLIC_SUBGRAPH_URL not set");
  }
  const res = await fetch(config.subgraphUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    throw new Error(`subgraph request failed: ${res.status}`);
  }
  const body = (await res.json()) as GraphResponse<T>;
  if (body.errors?.length) {
    throw new Error(body.errors[0].message);
  }
  return body.data as T;
}

export async function fetchProposals(state?: string, first = 50): Promise<ProposalEntity[]> {
  const where = state ? `{ state: "${state}" }` : "{ state_not: \"\" }";
  const query = /* GraphQL */ `
    query Proposals($first: Int!) {
      proposals(first: $first, orderBy: createdAt, orderDirection: desc, where: ${where}) {
        id
        proposer
        title
        description
        startBlock
        endBlock
        state
        votesFor
        votesAgainst
        votesAbstain
        createdAt
      }
    }
  `;
  const data = await graph<{ proposals: ProposalEntity[] }>(query, { first });
  return data.proposals ?? [];
}

export interface ProposalDetailEntity extends ProposalEntity {
  votes: VoteEntity[];
}

export async function fetchProposal(id: string): Promise<ProposalDetailEntity | null> {
  const data = await graph<{ proposal: ProposalDetailEntity | null }>(
    /* GraphQL */ `
      query Proposal($id: ID!) {
        proposal(id: $id) {
          id
          proposer
          title
          description
          startBlock
          endBlock
          state
          votesFor
          votesAgainst
          votesAbstain
          createdAt
          votes {
            id
            voter
            support
            weight
            reason
          }
        }
      }
    `,
    { id }
  );
  return data.proposal;
}

export async function fetchDelegates(first = 50): Promise<DelegateEntity[]> {
  const data = await graph<{ delegates: DelegateEntity[] }>(
    /* GraphQL */ `
      query Delegates($first: Int!) {
        delegates(first: $first, orderBy: votingPower, orderDirection: desc) {
          id
          votingPower
          delegatorCount
        }
      }
    `,
    { first }
  );
  return data.delegates ?? [];
}
