"use client";

import { useReadContract, useBalance } from "wagmi";
import { govTokenAbi } from "@/lib/abis";
import { config, isZeroAddress } from "@/lib/config";

const treasuryAddress = config.treasuryAddress as `0x${string}`;
const govTokenAddress = config.govTokenAddress as `0x${string}`;

const enabled = () => !isZeroAddress(config.treasuryAddress);

export function useTreasuryEthBalance() {
  return useBalance({
    address: treasuryAddress,
    query: { enabled: enabled() },
  });
}

export function useTreasuryGovBalance() {
  return useReadContract({
    abi: govTokenAbi,
    address: govTokenAddress,
    functionName: "balanceOf",
    args: treasuryAddress ? [treasuryAddress] : undefined,
    query: { enabled: enabled() && !isZeroAddress(config.govTokenAddress) },
  });
}
