import { useRef } from "react";
import { Contract, BrowserProvider, type Eip1193Provider } from "ethers";
import TestamentArtifact from "../abi/Testament.json";
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { testamentAddress } from "../lib/constants.ts";

export function PingButton({ refetch }: { refetch: () => void }) {
  const { walletProvider } = useAppKitProvider<Eip1193Provider>("eip155");
  const { isConnected } = useAppKitAccount();
  const toast = useRef<Toast>(null);

  const handlePing = async () => {
    if (!walletProvider || !isConnected) {
      toast.current?.show({
        severity: "warn",
        summary: "Wallet not connected",
        detail: "Please connect your wallet first.",
      });
      return;
    }

    try {
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();

      const contract = new Contract(testamentAddress, TestamentArtifact.abi, signer);
      const tx = await contract.ping();

      toast.current?.show({
        severity: "info",
        summary: "Transaction sent",
        detail: `Tx hash: ${tx.hash.slice(0, 10)}...`,
      });

      await tx.wait();

      toast.current?.show({
        severity: "success",
        summary: "Ping confirmed",
        detail: "Your ping was successful!",
      });

      refetch();

    } catch (err: any) {
      console.error("Ping failed:", err);
      toast.current?.show({
        severity: "error",
        summary: "Ping failed",
        detail: err?.reason ?? err?.message ?? "See console for details.",
      });
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Button
        label="I'm still alive"
        icon="pi pi-heart"
        className="p-button-lg"
        onClick={handlePing}
      />
    </>
  );
}
