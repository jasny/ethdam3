import { useEffect, useState } from "react";
import { formatEther, type Eip1193Provider } from "ethers";
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from "@reown/appkit/react";
import { arbitrumSepolia } from "@reown/appkit/networks"
import { JsonRpcProvider } from "ethers"

export function useEthBalance() {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Eip1193Provider>("eip155");
  const [balance, setBalance] = useState<string | null>(null);
  const [max, setMax] = useState<number | null>(null);

  const { chainId } = useAppKitNetwork();

  const fetchBalance = async () => {
    if (!isConnected || !address || !walletProvider) return;

    const rpcUrl = arbitrumSepolia.rpcUrls.default?.http[0];
    if (!rpcUrl) throw new Error("Arbitrum Sepolia RPC URL not found");

    try {
      const provider = new JsonRpcProvider(rpcUrl);
      const rawBalance = await provider.getBalance(address);
      setBalance(formatEther(rawBalance));
      setMax(Number(formatEther(rawBalance)));
    } catch (err) {
      console.error("Error fetching balance:", err);
      setBalance(null);
    }
  };

  useEffect(() => {
    fetchBalance().then();
  }, [isConnected, address, walletProvider, chainId]);

  return { balance, max, refetch: fetchBalance };
}
