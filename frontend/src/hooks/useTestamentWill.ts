import { useEffect, useState } from "react";
import { Contract, JsonRpcProvider } from "ethers";
import TestamentArtifact from "../abi/Testament.json";
import { sapphireTestnet } from "@reown/appkit/networks";
import { testamentAddress } from "../lib/constants";

type Heir = {
  heir: string;
  points: bigint;
};

export function useTestamentWill(ownerAddress?: string) {
  const [heirs, setHeirs] = useState<Heir[] | null>(null);
  const [points, setPoints] = useState<bigint | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchWill = async () => {
    if (!ownerAddress) return;

    const rpcUrl = sapphireTestnet.rpcUrls.default?.http[0];
    if (!rpcUrl) throw new Error("Sapphire Testnet RPC URL not found");

    const provider = new JsonRpcProvider(rpcUrl);
    const contract = new Contract(testamentAddress, TestamentArtifact.abi, provider);

    try {
      setLoading(true);
      const [heirsResult, pointsResult, message] = await contract.revealWill(ownerAddress);
      setHeirs(heirsResult);
      setPoints(pointsResult);
      setMessage(message);
    } catch (err) {
      console.error("Error fetching will:", err);
      setHeirs(null);
      setPoints(null);
      setMessage(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWill().then();
  }, [ownerAddress]);

  return { heirs, points, message, loading, refetch: fetchWill };
}
