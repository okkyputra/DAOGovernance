#!/usr/bin/env bash
# Deploys DAO contracts to a chain, then wires addresses into web/.env.local
# and subgraph/subgraph.yaml.
#
# Usage:
#   ./scripts/deploy.sh sepolia
#
# Requires contracts/.env with:
#   RPC_SEPOLIA_URL, PRIVATE_KEY (and ETHERSCAN_API_KEY for --verify)
set -euo pipefail

CHAIN="${1:-sepolia}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTRACTS="$ROOT/contracts"
WEB="$ROOT/web"

cd "$CONTRACTS"
set -a; source .env; set +a

case "$CHAIN" in
  sepolia)
    RPC_URL="${RPC_SEPOLIA_URL:?RPC_SEPOLIA_URL not set in contracts/.env}"
    CHAIN_ID=11155111
    ;;
  mainnet)
    RPC_URL="${RPC_MAINNET_URL:?RPC_MAINNET_URL not set in contracts/.env}"
    CHAIN_ID=1
    ;;
  *)
    echo "Unknown chain '$CHAIN' (use: sepolia | mainnet)" >&2
    exit 1
    ;;
esac
if [ -z "${PRIVATE_KEY:-}" ]; then
  echo "PRIVATE_KEY not set in contracts/.env" >&2
  exit 1
fi

echo ">>> Deploying to $CHAIN..."
VERIFY_FLAG=""
[ -n "${ETHERSCAN_API_KEY:-}" ] && VERIFY_FLAG="--verify --etherscan-api-key $ETHERSCAN_API_KEY"

OUTPUT=$(PRIVATE_KEY="$PRIVATE_KEY" forge script script/DeployDAO.s.sol:DeployDAO \
  --rpc-url "$RPC_URL" --broadcast $VERIFY_FLAG 2>&1)

echo "$OUTPUT"

GOVERNOR=$(echo "$OUTPUT" | grep -oP 'Governor:\s+\K0x[0-9a-fA-F]{40}' | tail -1)
TOKEN=$(echo "$OUTPUT" | grep -oP 'GovToken:\s+\K0x[0-9a-fA-F]{40}' | tail -1)
TIMELOCK=$(echo "$OUTPUT" | grep -oP 'Timelock:\s+\K0x[0-9a-fA-F]{40}' | tail -1)
TREASURY=$(echo "$OUTPUT" | grep -oP 'Treasury:\s+\K0x[0-9a-fA-F]{40}' | tail -1)

for var in GOVERNOR TOKEN TIMELOCK TREASURY; do
  if [ -z "${!var}" ]; then
    echo "!! Could not parse $var from script output" >&2
    exit 1
  fi
done

echo ">>> Wiring addresses..."
cat > "$WEB/.env.local" <<EOF
NEXT_PUBLIC_CHAIN_ID=$CHAIN_ID
NEXT_PUBLIC_GOVERNOR_ADDRESS=$GOVERNOR
NEXT_PUBLIC_GOVTOKEN_ADDRESS=$TOKEN
NEXT_PUBLIC_TIMELOCK_ADDRESS=$TIMELOCK
NEXT_PUBLIC_TREASURY_ADDRESS=$TREASURY
NEXT_PUBLIC_SUBGRAPH_URL=
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
EOF
echo "  wrote $WEB/.env.local"

echo
echo "Done. Addresses:"
echo "  Governor: $GOVERNOR"
echo "  GovToken: $TOKEN"
echo "  Timelock: $TIMELOCK"
echo "  Treasury: $TREASURY"
echo
echo "Next: set NEXT_PUBLIC_SUBGRAPH_URL in $WEB/.env.local after deploying the subgraph."
echo "      Deploy subgraph: cd subgraph && npm run deploy (needs Graph Studio key)."
