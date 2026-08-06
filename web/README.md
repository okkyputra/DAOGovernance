# Web — DAO Governance frontend

Next.js 16 (App Router) + TypeScript + Tailwind + wagmi/viem + RainbowKit + TanStack Query. Dark theme.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Dashboard — voting power, proposal stats, recent proposals |
| `/proposals` | Proposal list, filterable by state (Pending/Active/Succeeded/…) |
| `/proposals/:id` | Proposal detail — vote tally, description, vote panel (For/Against/Abstain tx) |
| `/proposals/new` | Create proposal wizard (Phase 5) |
| `/delegates` | Delegate leaderboard — voting power, delegators, "Delegate to this address" tx |
| `/treasury` | Treasury dashboard (Phase 6) |

## Setup

```bash
npm install
cp .env.example .env.local   # fill in addresses + subgraph URL
npm run dev                  # http://localhost:3000
```

## Env vars (`web/.env.local`)

| Var | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CHAIN_ID` | 11155111 (Sepolia) |
| `NEXT_PUBLIC_GOVERNOR_ADDRESS` | Governor contract |
| `NEXT_PUBLIC_GOVTOKEN_ADDRESS` | GovToken contract |
| `NEXT_PUBLIC_TIMELOCK_ADDRESS` | TimelockController |
| `NEXT_PUBLIC_TREASURY_ADDRESS` | Treasury |
| `NEXT_PUBLIC_SUBGRAPH_URL` | Deployed subgraph endpoint |
| `NEXT_PUBLIC_API_URL` | Off-chain API (comments etc.) |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project ID |

Until contracts are deployed to Sepolia and the subgraph is published, pages show configured empty/notice states. Contract ABIs live in `src/lib/abis.ts` (subset for read/write used here).
