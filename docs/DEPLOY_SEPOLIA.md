# Sepolia Deployment Guide

Goal: get the DAO running live on Sepolia testnet — real proposals, votes, execution.

## Prerequisites

1. **Sepolia RPC** — create a free key at Alchemy or Infura.
2. **Testnet wallet** — any EOA. Fund with Sepolia ETH from a faucet (e.g. sepoliafaucet.com).
3. **ETHERSCAN_API_KEY** — free at etherscan.io (optional, only for `--verify`).
4. **Graph Studio** — free account at thegraph.com/studio for the subgraph.

## Step 1 — Configure secrets

```bash
cd contracts
cp .env.example .env
# edit .env: RPC_SEPOLIA_URL, PRIVATE_KEY (no 0x), ETHERSCAN_API_KEY (optional)
```

Optional overrides in `.env`:
- `GUARDIAN=0x...` — emergency-cancel address (defaults to deployer). Use a multisig or a separate wallet.
- `MIN_DELAY`, `VOTING_DELAY`, `VOTING_PERIOD`, `PROPOSAL_THRESHOLD`, `QUORUM_NUMERATOR`.

## Step 2 — Deploy contracts + wire the web app

```bash
./scripts/deploy.sh sepolia
```

This deploys all 4 contracts, verifies on Etherscan (if key set), and writes
`web/.env.local` with the addresses.

## Step 3 — Deploy the subgraph

```bash
cd subgraph
```
Edit `subgraph/subgraph.yaml` — set the two `address:` fields to the GovToken
and Governor addresses from the deploy output, and `startBlock` to the
deployment block.

```bash
npm run codegen
npm run build
graph auth --studio <your-key>     # from Graph Studio dashboard
npm run deploy                      # or: graph deploy --studio dao-governance
```

Copy the deployed subgraph URL into `NEXT_PUBLIC_SUBGRAPH_URL` in `web/.env.local`.

## Step 4 — Run the app

```bash
cd web
npm run dev      # http://localhost:3000
```

## Step 5 — First live proposal (smoke test)

1. Fund treasury: send ETH + GOV to the Treasury address.
2. Self-delegate: connect wallet → Delegates page → delegate to self.
3. Create a treasury-transfer proposal in the wizard.
4. Vote For (voting starts after 1-day delay).
5. After it passes, queue it, wait 2 days, execute.
6. Check Treasury page shows the outflow.

## Verify a deployed contract

```bash
cd contracts
source .env
forge verify-contract <address> src/GovToken.sol:GovToken --chain sepolia --etherscan-api-key $ETHERSCAN_API_KEY
```
