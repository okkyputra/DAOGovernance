# Subgraph — DAO Governance

The Graph subgraph indexing Governor + GovToken events on Sepolia.

## Data sources

- **Governor** — `ProposalCreated`, `VoteCast`, `ProposalCanceled`, `ProposalQueued`, `ProposalExecuted`
- **GovToken** — `DelegateChanged`, `DelegateVotesChanged`

## Entities

| Entity | Indexes |
| --- | --- |
| `Proposal` | proposer, vote window (start/end block), state, vote tallies, description |
| `Vote` | voter, support (0=Against, 1=For, 2=Abstain), weight, reason |
| `Delegate` | voting power, delegator count |

## Usage

```bash
npm run codegen
npm run build
npm run deploy   # graph deploy --studio dao-governance
```

Set the deployed `Governor` and `GovToken` addresses in `subgraph.yaml` before deploying.
