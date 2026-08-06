export const config = {
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 11155111),
  governorAddress: process.env.NEXT_PUBLIC_GOVERNOR_ADDRESS ?? "",
  govTokenAddress: process.env.NEXT_PUBLIC_GOVTOKEN_ADDRESS ?? "",
  timelockAddress: process.env.NEXT_PUBLIC_TIMELOCK_ADDRESS ?? "",
  treasuryAddress: process.env.NEXT_PUBLIC_TREASURY_ADDRESS ?? "",
  subgraphUrl: process.env.NEXT_PUBLIC_SUBGRAPH_URL ?? "",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
} as const;

export const isZeroAddress = (addr: string) => !addr || addr === "0x" + "0".repeat(40);
export const contractsDeployed = () =>
  !isZeroAddress(config.governorAddress) && !isZeroAddress(config.govTokenAddress);
