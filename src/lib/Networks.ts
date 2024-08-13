import {
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  sepolia,
  zora,
  zoraSepolia,
} from "viem/chains";

export const Networks: Record<number, any> = {
  [zora.id]: {
    etherActorPrefix: "zora",
    data: zora,
  },
  [zoraSepolia.id]: {
    etherActorPrefix: "zora-sepolia",
    data: zoraSepolia,
  },
  [mainnet.id]: {
    etherActorPrefix: "mainnet",
    data: mainnet,
  },
  [sepolia.id]: {
    etherActorPrefix: "sepolia",
    data: sepolia,
  },
  [base.id]: {
    etherActorPrefix: "base",
    data: base,
  },
  [optimism.id]: {
    etherActorPrefix: "opt",
    data: base,
  },
  [optimismSepolia.id]: {
    etherActorPrefix: "osep",
    data: optimismSepolia,
  },
  [baseSepolia.id]: {
    etherActorPrefix: "base-sepolia",
    data: baseSepolia,
  },
};
