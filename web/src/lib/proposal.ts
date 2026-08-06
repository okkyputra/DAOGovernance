import { encodeFunctionData, type Abi } from "viem";
import { treasuryAbi } from "./abis";

export type ProposalAction =
  | { kind: "treasury-transfer"; token: string; to: string; amount: string }
  | { kind: "signal"; text: string }
  | { kind: "contract-call"; target: string; calldata: string; value: string };

export function buildProposal(action: ProposalAction): {
  targets: `0x${string}`[];
  values: bigint[];
  calldatas: `0x${string}`[];
} {
  if (action.kind === "signal") {
    return { targets: [], values: [], calldatas: [] };
  }
  if (action.kind === "treasury-transfer") {
    const targets: `0x${string}`[] = [
      (process.env.NEXT_PUBLIC_TREASURY_ADDRESS ?? "") as `0x${string}`,
    ];
    const calldatas = [
      encodeFunctionData({
        abi: treasuryAbi as Abi,
        functionName: "withdraw",
        args: [action.token as `0x${string}`, action.to as `0x${string}`, BigInt(action.amount)],
      }),
    ];
    return { targets, values: [0n], calldatas };
  }
  const targets = [action.target as `0x${string}`];
  const values = [BigInt(action.value || "0")];
  const calldatas = [action.calldata as `0x${string}`];
  return { targets, values, calldatas };
}

export function describeAction(action: ProposalAction): string {
  if (action.kind === "signal") return `Signal-only proposal: ${action.text}`;
  if (action.kind === "treasury-transfer") {
    const isEth = action.token === "" || action.token.toLowerCase() === "0x" + "0".repeat(40);
    const asset = isEth ? "ETH" : action.token.slice(0, 8) + "…";
    return `Transfer ${action.amount} ${asset} to ${action.to}`;
  }
  return `Call contract ${action.target} (value ${action.value})`;
}
