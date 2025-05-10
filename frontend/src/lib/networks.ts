import { arbitrumSepolia, sapphireTestnet } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit-common';

export const customArbitrumSepolia = {
  ...arbitrumSepolia,
  contracts: {
    vault: { address: '0xEe93c8c13ccAdDD6c7Ac36E10698d8634e7E82e1' }, // your Vault address
  },
}

export const customSapphireTestnet = {
  ...sapphireTestnet,
  contracts: {
    testament: { address: '0xdC7Fe962da16C633fdB9Acd4E6bD19aC1d078a6a' }, // your Testament address
  },
}

export const networks = [customArbitrumSepolia, customSapphireTestnet] as [AppKitNetwork, AppKitNetwork]
