"use client";
import "@rainbow-me/rainbowkit/styles.css";

import * as React from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  getDefaultConfig,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  okxWallet,
  trustWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { celo, lisk, liskSepolia, celoAlfajores } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

const { wallets } = getDefaultWallets();

const config = getDefaultConfig({
  appName: "Minth",
  projectId: "7b4405ad426eb6d4e981a8570a10337c",
  wallets: [
    {
      groupName: "Other",
      wallets: [metaMaskWallet, okxWallet, trustWallet],
    },
    ...wallets,
    //
  ],
  chains: [
    lisk,
    celo,
    liskSepolia,
    celoAlfajores,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
      ? [celoAlfajores]
      : []),
  ],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#DAA520",
            accentColorForeground: "white",

            fontStack: "system",
            overlayBlur: "small",
            borderRadius: "large",
          })}
          modalSize="compact"
        // initialChain={celo}
        >
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
