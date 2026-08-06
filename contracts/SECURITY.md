# Security Review — DAO Governance Contracts

Static analysis (Slither/Mythril) could not be run in this environment (no pip/sudo to install). This is a manual review covering the attack surface. **A professional audit is still required before mainnet funds are held.**

## Reviewed surface

- `GovToken` — ERC20Votes (checkpointed voting power), ERC20Permit, Ownable mint. All supply minted to treasury at deploy; ownership renounced.
- `Governor` — OZ v5.5: GovernorSettings + GovernorCountingSimple + GovernorVotes + GovernorVotesQuorumFraction + GovernorTimelockControl.
- `TimelockController` (OZ) — proposer/canceller/executor roles; executor role granted to `address(0)` (open).
- `Treasury` — Ownable vault; owner is the Timelock; `withdraw` gated by `onlyOwner`.

## Findings & mitigations already in place

| # | Issue | Status |
| --- | --- | --- |
| 1 | Flash-loan governance attack | Mitigated: ERC20Votes snapshots voting power via checkpoints (`_getVotes` reads past clock), not live balance. |
| 2 | Rogue executor bypassing vote | Mitigated: funds live in Treasury owned by Timelock; Governor alone can schedule/queue via PROPOSER_ROLE; only Timelock can move funds. |
| 3 | Malicious proposal before execution | Mitigated: 2-day `minDelay`; Guardian holds `CANCELLER_ROLE` on Timelock and can cancel during the window. |
| 4 | Proposal spam | Mitigated: `proposalThreshold` = 100,000 GOV; quorum = 4% of supply. |
| 5 | Timelock proposer DoS | Mitigated at deploy: deployer's PROPOSER/CANCELLER/DEFAULT_ADMIN roles revoked; Governor is sole proposer; admin role transferred away. |
| 6 | Governor can't be a contract (no receive) | WARNING (see below). |

## Open items / manual review notes

1. **OZ Governor.sol already reverts on unsupported calldatas** in `_execute` — confirm during audit.
2. **`GovernorTimelockControl` trust assumption** — the code comments state the timelock is trusted and well-behaved; a malicious timelock grants full power. Keep `TimelockController` unmodified (OZ).
3. **Treasury `withdraw` to arbitrary `to`** — no zero-address check on `to`. Funds would be burned (ETH) / lost (ERC20) if a proposal sets `to = address(0)`. Consider adding a guard (see below).
4. **Guardian is a single EOA in the deploy script** by default — plan says a multisig (not EOA) should hold cancel power. Upgrade before mainnet.
5. **`executors` set to `address(0)` (open execution)** — anyone can call `execute` on the timelock once ready. This is OZ's standard open-executor pattern and is safe (execution is already gated by the governor's queue), but confirm it's intended.

## Required before mainnet

- Professional audit (at least one firm).
- Slither/Mythril static analysis pass in CI.
- Guardian upgraded to a multisig.
- Fuzz tests on proposal lifecycle.

## Suggested hardening applied

- Added zero-address guard to `Treasury.withdraw` so proposals can't burn funds.
