import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi";
import {
  mainnet,
  zora,
  zoraSepolia,
  sepolia,
  baseSepolia,
  base,
  optimism,
  optimismSepolia,
} from "viem/chains";
import { reconnect } from "@wagmi/core";

// 1. Get a project ID at https://cloud.walletconnect.com
const projectId = "3b137f5a80e318b2a637f72b274ba28a";

// 2. Create wagmiConfig
const metadata = {
  name: "Wei.tools",
  description: "Wei Tools",
  url: "https://wei.tools", // origin must match your domain & subdomain.
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const chains = [
  mainnet,
  zora,
  zoraSepolia,
  sepolia,
  base,
  baseSepolia,
  optimism,
  optimismSepolia,
] as const;
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  //   ...wagmiOptions // Optional - Override createConfig parameters
});
reconnect(config);

// 3. Create modal
export const modal = createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false, // Optional - defaults to your Cloud configuration
  enableOnramp: true, // Optional - false as default
});