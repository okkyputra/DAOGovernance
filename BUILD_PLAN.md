# DAO Governance Platform — Full Build Plan

## 0. Scope & Assumptions

Since you didn't specify a chain/stack, this plan assumes the most common, well-audited pattern used by real DAOs (Compound, Uniswap, ENS):

- Chain: EVM-compatible (Ethereum mainnet for prod, an L2 like Base or Arbitrum for lower gas, Sepolia for testnet)
- Contracts: Solidity + OpenZeppelin Governor framework
- Frontend: Next.js (App Router) + TypeScript + Tailwind + wagmi/viem + RainbowKit
- Indexing: The Graph subgraph (or a lightweight custom indexer if you want to avoid The Graph)
- Off-chain data: IPFS for proposal metadata, Postgres for caching/discussion

If you'd rather build on Solana, Cosmos, or a specific existing framework (Aragon, Snapshot, Tally-style), the phases below still apply — swap the contract layer and adjust the frontend SDK.

## 1. Product Definition

Core user stories:

- As a token holder, I can see my voting power and delegate it (to myself or someone else)
- As a token holder, I can view all proposals and their status
- As a qualifying token holder, I can create a new proposal
- As a token holder, I can vote For / Against / Abstain, optionally with a reason
- As anyone, I can see the treasury, past spending, and pending proposals affecting it
- As a delegate, I can build a public profile so others delegate to me
- As a guardian/multisig, I can cancel a malicious proposal before execution

| Role | Capability |
| --- | --- |
| Token holder | Vote, delegate |
| Delegate | Receives delegated voting power, ideally posts voting rationale |
| Proposer | Token holder above a proposal threshold |
| Guardian (multisig) | Emergency-cancel proposals during timelock |
| Anyone (no wallet) | Read-only view of everything |

## 2. Architecture

```
┌─────────────────────┐     ┌──────────────────────┐
│   Next.js Frontend    │◄──►│  Indexer / Subgraph   │
│  (wagmi, viem, Rain-  │     │  (proposal/vote data) │
│   bowKit, TanStack Q) │     └──────────┬────────────┘
└──────────┬───────────┘                │
           │                            ▼
           │                    ┌───────────────┐
           │                    │   Postgres     │
           │                    │ (cache, discus-│
           │                    │  sions, profile)│
           ▼                    └───────────────┘
┌──────────────────────┐
│   Smart Contracts      │
│  - GovToken (ERC20Votes)
│  - Governor (OZ Governor
│    + Timelock + Counting)
│  - TimelockController
│  - Treasury (Gnosis Safe
│    owned by Timelock)
└──────────────────────┘
           ▲
           │
      IPFS (proposal descriptions, off-chain metadata)
```

Why this shape:

- Governor contract is the source of truth (on-chain, trustless)
- Subgraph/indexer exists purely so the UI doesn't have to scan the whole chain for every page load
- Postgres holds non-critical data (comments, delegate bios) — never anything that affects voting outcomes
- Treasury is a Safe multisig owned by the Timelock, so funds only move via passed proposals

## 3. Smart Contract Design

- **GovToken.sol** — ERC20Votes (checkpointed balances so voting power is snapshotted, preventing flash-loan governance attacks)
- **Governor.sol** — extends Governor, GovernorSettings, GovernorCountingSimple, GovernorVotes, GovernorVotesQuorumFraction, GovernorTimelockControl
  - Voting delay (e.g. 1 day before voting starts)
  - Voting period (e.g. 5–7 days)
  - Proposal threshold (min tokens to propose)
  - Quorum (e.g. 4% of supply)
- **TimelockController.sol** — OZ standard; enforces a delay (e.g. 2 days) between a proposal passing and execution, giving the community time to react
- **Treasury** — a Gnosis Safe with the Timelock as the sole owner/executor, or a simple Vault contract only callable by the Timelock

Proposal lifecycle (Governor's built-in state machine): Pending → Active → Canceled/Defeated/Succeeded → Queued → Executed/Expired

## 4. Data Model

On-chain (read via contract calls / events):

- **Proposal**: id, proposer, targets[], values[], calldatas[], descriptionHash, startBlock, endBlock, state
- **Votes**: voter, proposalId, support (0=Against,1=For,2=Abstain), weight, reason
- **Delegation**: delegator, delegatee, votingPower

Off-chain (Postgres):

- `proposals_meta(id, ipfs_hash, title, summary, category, created_at)`
- `comments(id, proposal_id, author, body, created_at)`
- `delegate_profiles(address, ens_name, bio, avatar_url, platform, twitter)`
- `notifications(user_address, type, proposal_id, read)`

## 5. Feature Breakdown

- **Wallet connect** — RainbowKit modal, show connected address/ENS, token balance, current voting power
- **Delegation** — self-delegate button, "delegate to address" input, delegate leaderboard (sorted by voting power received)
- **Proposal creation wizard (multi-step)**:
  - Choose action type (transfer funds, call contract, change a parameter, or "signal-only" text proposal)
  - Build the target/calldata (a simplified form for common actions, raw calldata input for advanced users)
  - Write title + description (markdown editor)
  - Review + simulate (optional: Tenderly simulation to preview outcome)
  - Sign and submit — description gets pinned to IPFS, hash included in the on-chain proposal
- **Proposal list** — filterable by state (Active, Succeeded, Defeated, Queued, Executed, Canceled), sortable by votes/date
- **Proposal detail page** — vote breakdown bar (For/Against/Abstain), quorum progress, countdown timer, decoded calldata ("this proposal will transfer 50,000 USDC to `0x...`"), discussion thread, vote button with optional reason text
- **Treasury dashboard** — current holdings (multi-asset), historical outflows chart, list of proposals that touched treasury
- **Analytics** — participation rate over time, top delegates, proposal pass/fail rate
- **Notifications** — proposal created, voting closes soon, ready to execute (email/webhook optional)
- **Guardian panel** — visible only to guardian multisig signers; emergency cancel during timelock

## 6. UI/UX Detail

Design language: data-dense but clean — think a hybrid of a trading dashboard and a voting ballot. Dark mode by default (most DAO tooling audiences prefer it), status communicated primarily through color (green = succeeded/active-and-winning, red = defeated, amber = queued/pending, gray = expired/canceled).

| Page | Key components |
| --- | --- |
| Dashboard/Home | Your voting power card, quick stats (total proposals, active count, treasury value), recent proposals feed |
| Proposals list | Filter/sort bar, card per proposal (title, state badge, vote tally mini-bar, time remaining) |
| Proposal detail | Header (title, proposer, state badge), big vote tally chart, quorum progress bar, countdown, decoded actions list, markdown description, vote panel (sticky sidebar with For/Against/Abstain buttons + your voting power), discussion thread below |
| Create proposal | Step wizard with a progress indicator, live preview panel on the right showing exactly what will be submitted |
| Delegates | Table: address/ENS, voting power, delegator count, bio snippet, "Delegate to this address" button |
| Treasury | Asset table with USD values, spending-over-time chart, list of related proposals |
| Profile / My Votes | Your past votes, your delegation status, proposals you've created |

Component-level notes:

- Vote tally should always show both raw token counts and percentages — DAOs care about both
- Every state badge should be a consistent color token reused everywhere (list, detail, notifications)
- Calldata should never be shown raw to average users by default — decode it into plain English with an expandable "raw calldata" toggle for power users

## 7. Step-by-Step Build Phases

### Phase 0 — Setup

- Init monorepo (e.g. Turborepo): `/contracts`, `/subgraph`, `/web`, `/api`
- Choose chain + testnet, set up Foundry or Hardhat, set up RPC provider (Alchemy/Infura)

### Phase 1 — Smart contracts

- Write GovToken, Governor, Timelock
- Write full test suite (proposal creation, voting, quorum, timelock delay, execution, guardian cancel)
- Deploy to testnet, verify on block explorer

### Phase 2 — Indexing

- Write subgraph (or lightweight ethers.js event listener) that tracks ProposalCreated, VoteCast, ProposalExecuted, DelegateChanged
- Deploy subgraph to The Graph's hosted service / Studio (testnet)

### Phase 3 — Backend/API

- Postgres schema + API routes for comments, delegate profiles, notifications
- IPFS pinning service integration (Pinata or web3.storage) for proposal descriptions

### Phase 4 — Frontend core

- Wallet connection, read voting power, read proposal list from subgraph
- Dashboard + proposal list pages

### Phase 5 — Frontend interaction

- Proposal detail page with live vote tally
- Create-proposal wizard wired to contract writes
- Vote casting flow wired to contract writes
- Delegation flow

### Phase 6 — Treasury & analytics

- Treasury dashboard (fetch Safe balances)
- Analytics charts (participation, pass rate)

### Phase 7 — Hardening

- Get contracts audited (or at minimum run Slither/Mythril static analysis)
- Load-test subgraph queries, add error boundaries and empty states in UI
- Deploy contracts to mainnet, verify, transfer ownership to Timelock

### Phase 8 — Post-launch

- Monitoring (Tenderly alerts on Governor/Timelock events)
- Bug bounty
- Iterate on UX based on real proposal activity

## 8. Security Considerations

- **Flash-loan governance attacks**: mitigated by ERC20Votes checkpointing — voting power is snapshotted at proposal creation, not current balance
- **Timelock delay**: always keep a delay (24–72h) between a proposal passing and execution so the community can react to something malicious
- **Guardian/emergency cancel**: a multisig (not a single EOA) should hold cancel power during the timelock window
- **Proposal threshold & quorum**: tune so a single whale can't spam proposals, and so passing something requires meaningful participation
- **Audit before mainnet**: this is non-negotiable for anything holding real treasury funds — get at least one professional audit plus static analysis
- **Never let off-chain (Postgres) data influence on-chain outcomes** — it's for UX only

## 9. Prompts to Build Each Phase Efficiently

Use these one phase at a time — trying to generate the whole app in one prompt produces shallow, broken output. Feed it the relevant phase context from this doc.

### Smart contracts

> Using Foundry, create a DAO governance system: an ERC20Votes governance token (GovToken), an OpenZeppelin Governor contract combining GovernorSettings, GovernorCountingSimple, GovernorVotes, GovernorVotesQuorumFraction, and GovernorTimelockControl, and a TimelockController. Voting delay 1 day, voting period 7 days, proposal threshold configurable, quorum 4%. Include a full Foundry test suite covering: proposal creation, voting with all three support types, quorum failure, successful queue+execute, and guardian cancel during timelock. Use current OpenZeppelin Contracts v5 syntax.

### Subgraph

> Create a subgraph (or a Node.js/ethers.js event indexer if not using The Graph) for this Governor contract [paste ABI/address] that tracks ProposalCreated, VoteCast, ProposalQueued, ProposalExecuted, ProposalCanceled, and DelegateChanged/DelegateVotesChanged events, storing them in entities queryable by proposal id and voter address.

### Frontend core

> Build a Next.js 14 App Router + TypeScript + Tailwind + wagmi v2 + viem + RainbowKit frontend for a DAO governance dashboard. Dark theme. Pages: dashboard (voting power, quick stats), proposal list (filterable by state, card layout with vote tally mini-bars), proposal detail (vote tally chart, quorum progress bar, countdown timer, decoded calldata, vote panel). Fetch proposal data from [subgraph URL]. Use TanStack Query for data fetching and caching.

### Proposal creation wizard

> Build a multi-step proposal creation wizard in this Next.js app: step 1 choose action type (treasury transfer / contract call / signal-only), step 2 build target/calldata with a simplified form for treasury transfers and a raw calldata field for advanced users, step 3 markdown description editor, step 4 review + submit. On submit, pin the description to IPFS via [Pinata/web3.storage], then call propose() on the Governor contract with the resulting hash included in the description field, using wagmi's useWriteContract.

### Treasury dashboard

> Build a treasury dashboard page that fetches the connected Gnosis Safe's asset balances via the Safe Transaction Service API, displays them in a table with USD values (via a price API), and shows a chart of historical outflows derived from indexed ProposalExecuted events that touched the treasury address.

## 10. Suggested Stack Summary

| Layer | Choice |
| --- | --- |
| Chain | Ethereum L2 (Base/Arbitrum) for low gas, or mainnet for prod-grade legitimacy |
| Contracts | Solidity 0.8.x, OpenZeppelin Contracts v5, Foundry |
| Treasury | Gnosis Safe owned by Timelock |
| Indexing | The Graph (or custom ethers.js indexer) |
| Backend | Node.js/Next.js API routes + Postgres |
| File storage | IPFS via Pinata or web3.storage |
| Frontend | Next.js App Router, TypeScript, Tailwind, wagmi/viem, RainbowKit, TanStack Query |
| Deploy | Vercel (frontend), Alchemy/Infura (RPC) |
