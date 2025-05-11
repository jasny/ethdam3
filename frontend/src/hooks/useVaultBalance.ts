import { useEffect, useState } from "react";
import { Contract, JsonRpcProvider, formatEther } from "ethers";
import { useAppKitAccount } from "@reown/appkit/react";
import VaultArtifact from "../abi/Vault.json";
import { vaultAddress } from "../lib/constants";
import { arbitrumSepolia } from "@reown/appkit/networks";

export function useVaultBalance(overrideAddress?: string) {
  const { address: accountAddress } = useAppKitAccount();
  const [balance, setBalance] = useState<number | null>(null);

  const fetchBalance = async () => {
    const address = overrideAddress ?? accountAddress;
    if (!address) return;

    const rpcUrl = arbitrumSepolia.rpcUrls.default?.http[0];
    if (!rpcUrl) throw new Error("Arbitrum Sepolia RPC URL not found");

    const provider = new JsonRpcProvider(rpcUrl);
    const contract = new Contract(vaultAddress, VaultArtifact.abi, provider);

    try {
      const result = await contract.getBalance(address);
      const eth = result[0]; // ETH balance (BigInt)
      setBalance(Number(formatEther(eth)));
    } catch (err) {
      console.error("Error fetching vault balance:", err);
      setBalance(null);
    }
  };

  useEffect(() => {
    fetchBalance().then();
  }, [overrideAddress, accountAddress]);

  return { balance, refetch: fetchBalance };
}
