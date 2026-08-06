# DAO Governance Contracts

GovToken, Governor, TimelockController, and Treasury — OpenZeppelin v5 Governor framework, built with Foundry.

## Contracts

| Contract | Purpose |
| --- | --- |
| `src/GovToken.sol` | ERC20Votes governance token (GOV), 100M max supply minted to treasury |
| `src/Governor.sol` | OZ Governor: GovernorSettings + GovernorCountingSimple + GovernorVotes + GovernorVotesQuorumFraction + GovernorTimelockControl |
| `src/Treasury.sol` | Vault owned by the Timelock; only the Timelock can move funds |
| (OZ) `TimelockController` | Enforces 2-day delay between passing and execution; Guardian holds CANCELLER_ROLE for emergency cancel |

Defaults: voting delay 1 day, voting period 7 days, proposal threshold 100,000 GOV, quorum 4% of supply, timelock delay 2 days.

## Usage

```bash
forge build
forge test
```

## Deploy

Set env vars (see `.env.example`), then:

```bash
source .env
forge script script/DeployDAO.s.sol:DeployDAO --rpc-url $RPC_SEPOLIA_URL --broadcast --verify
```

Post-deploy addresses are printed by the script. Verify on Etherscan with `--verify`.

## Architecture

- Tokens are minted to the Treasury at deployment.
- The Governor is granted PROPOSER and CANCELLER roles on the Timelock.
- The Guardian address gets CANCELLER_ROLE to emergency-cancel queued proposals.
- Treasury funds move only via `TimelockController.execute` -> passed proposals.
