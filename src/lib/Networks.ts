import { base, baseSepolia, mainnet, sepolia, zora, zoraSepolia } from 'viem/chains';

export const Networks: Record<number, any> = {
	[zora.id]: {
		etherActorPrefix: 'zora',
		data: zora
	},
	[zoraSepolia.id]: {
		etherActorPrefix: 'zora-sepolia',
		data: zoraSepolia
	},
	[mainnet.id]: {
		etherActorPrefix: 'mainnet',
		data: mainnet
	},
	[sepolia.id]: {
		etherActorPrefix: 'sepolia',
		data: sepolia
	},
	[base.id]: {
		etherActorPrefix: 'base',
		data: base
	},
	[baseSepolia.id]: {
		etherActorPrefix: 'base-sepolia',
		data: baseSepolia
	}
};
