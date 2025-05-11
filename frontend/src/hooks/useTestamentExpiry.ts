import { useEffect, useState } from "react";
import { Contract, JsonRpcProvider } from "ethers";
import { useAppKitAccount } from "@reown/appkit/react";
import { sapphireTestnet } from "@reown/appkit/networks";
import TestamentArtifact from "../abi/Testament.json";
import { testamentAddress } from "../lib/constants.ts";

export function useTestamentExpiry(overrideAddress?: string) {
  const { address: accountAddress } = useAppKitAccount();
  const [expiry, setExpiry] = useState<number | null>(null);

  const fetchExpiry = async () => {
    const address = overrideAddress ?? accountAddress;
    if (!address) return null;

    const rpcUrl = sapphireTestnet.rpcUrls.default?.http[0];
    if (!rpcUrl) throw new Error("Sapphire RPC URL not found");

    const provider = new JsonRpcProvider(rpcUrl);

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
  }, [overrideAddress, accountAddress]);

  return {
    expiry,
    refetch: () => fetchExpiry().then(result => setExpiry(result))
  };
}
