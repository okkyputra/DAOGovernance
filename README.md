# DAO Governance

A community-owned governance platform for proposals, votes, and treasury — built from the plan in [`BUILD_PLAN.md`](./BUILD_PLAN.md).

## Workspaces

| Directory   | Purpose                                              | Stack                                  |
| ----------- | ---------------------------------------------------- | -------------------------------------- |
| `contracts` | GovToken, Governor, TimelockController, Treasury     | Solidity 0.8.x, OpenZeppelin v5, Foundry |
| `subgraph`  | Indexing of Governor events (proposals, votes)       | The Graph, AssemblyScript               |
| `web`       | Frontend dashboard and governance UI                 | Next.js App Router, wagmi, RainbowKit   |
| `api`       | Off-chain backend (comments, delegate profiles, notifications) | Node.js, Express, Drizzle, Postgres |

Target chain: **Ethereum Sepolia** (testnet).

## Setup

```bash
npm install                          # install all workspaces
cp contracts/.env.example contracts/.env    # fill in RPC keys
cp api/.env.example api/.env
cp web/.env.example web/.env.local
```

## Development

```bash
npm run dev       # Next.js frontend (http://localhost:3000)
npm run dev --workspace=api   # API (http://localhost:3001)
```

Smart contract tests:

```bash
cd contracts && forge test
```

## Env vars

- `contracts/.env` — `RPC_SEPOLIA_URL`, `RPC_MAINNET_URL`, `ETHERSCAN_API_KEY`, `PRIVATE_KEY`
- `web/.env.local` — `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, contract addresses, `NEXT_PUBLIC_SUBGRAPH_URL`
- `api/.env` — `DATABASE_URL`, IPFS pinning keys

## Phase status

- [x] Phase 0 — monorepo setup, Foundry, Next.js, API, subgraph scaffolding
- [ ] Phase 1 — smart contracts
- [ ] Phase 2 — indexing
- [ ] Phase 3 — backend/API
- [ ] Phase 4 — frontend core
- [ ] Phase 5 — frontend interaction
- [ ] Phase 6 — treasury & analytics
- [ ] Phase 7 — hardening
- [ ] Phase 8 — post-launch
