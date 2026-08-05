"use client";

import { http, createConfig, cookieStorage, createStorage } from "wagmi";
import { sepolia, mainnet } from "wagmi/chains";
import { metaMask, walletConnect } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export function getConfig() {
  return createConfig({
    chains: [sepolia, mainnet],
    connectors: [
      metaMask(),
      ...(projectId ? [walletConnect({ projectId })] : []),
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [sepolia.id]: http(),
      [mainnet.id]: http(),
    },
  });
}
