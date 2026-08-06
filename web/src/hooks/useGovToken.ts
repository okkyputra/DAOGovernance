"use client";

import { useAccount, useReadContract } from "wagmi";
import { govTokenAbi } from "@/lib/abis";
import { config, isZeroAddress } from "@/lib/config";

const tokenAddress = config.govTokenAddress as `0x${string}`;

export function useTokenBalance() {
  const { address, isConnected } = useAccount();
  return useReadContract({
    abi: govTokenAbi,
    address: tokenAddress,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !isZeroAddress(config.govTokenAddress),
    },
  });
}

export function useVotingPower() {
  const { address, isConnected } = useAccount();
  return useReadContract({
    abi: govTokenAbi,
    address: tokenAddress,
    functionName: "getVotes",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !isZeroAddress(config.govTokenAddress),
    },
  });
}

export function useDelegateAddress() {
  const { address, isConnected } = useAccount();
  return useReadContract({
    abi: govTokenAbi,
    address: tokenAddress,
    functionName: "delegates",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !isZeroAddress(config.govTokenAddress),
    },
  });
}
