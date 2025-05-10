import { useEffect, useState } from "react";
import { Contract, BrowserProvider, type Eip1193Provider } from "ethers";
import { useAppKitProvider, useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import TestamentArtifact from "../abi/Testament.json";
import { testamentAddress } from "../lib/constants.ts"

export function useTestamentExpiry() {
  const { walletProvider } = useAppKitProvider<Eip1193Provider>("eip155");
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const [expiry, setExpiry] = useState<number | null>(null);

  const fetchExpiry = async () => {
    if (!isConnected || !address || !walletProvider || !chainId) return null;

    const provider = new BrowserProvider(walletProvider);

    const contract = new Contract(
      testamentAddress,
      TestamentArtifact.abi,
      provider
    );

    try {
      const result: bigint = await contract.getExpiry(address);
      return Number(result);
    } catch (err) {
      console.error("Error fetching expiry:", err);
      return null;
    }
  };

  useEffect(() => {
    fetchExpiry().then(result => setExpiry(result));
  }, [walletProvider, address, isConnected, chainId]);

  return {
    expiry,
    refetch: () => fetchExpiry().then(result => setExpiry(result))
  };
}
