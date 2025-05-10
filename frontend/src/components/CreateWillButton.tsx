import { Button } from "primereact/button";
import { useAppKitProvider, useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { BrowserProvider, Contract, type Eip1193Provider } from "ethers";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import TestamentArtifact from "../abi/Testament.json";
import { testamentAddress } from "../lib/constants";
import { sapphireTestnet } from "@reown/appkit/networks"

interface CreateWillButtonProps {
  message: string;
  beneficiaries: { address: string; points: number }[];
  longevity: number;
}

export function CreateWillButton({ message, beneficiaries, longevity }: CreateWillButtonProps) {
  const { walletProvider } = useAppKitProvider<Eip1193Provider>("eip155");
  const { isConnected } = useAppKitAccount();
  const { switchNetwork } = useAppKitNetwork();
  const toast = useRef<Toast>(null);

  const handleCreate = async () => {
    if (!walletProvider || !isConnected) {
      toast.current?.show({
        severity: "warn",
        summary: "Wallet not connected",
        detail: "Please connect your wallet first.",
      });
      return;
    }

    try {
      switchNetwork(sapphireTestnet);

      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();

      const contract = new Contract(testamentAddress, TestamentArtifact.abi, signer);

      const heirs = beneficiaries.map(b => ({
        heir: b.address,
        points: BigInt(b.points)
      }));

      const tx = await contract.createWill(message, heirs, BigInt(longevity));

      toast.current?.show({
        severity: "info",
        summary: "Transaction sent",
        detail: `Tx hash: ${tx.hash.slice(0, 10)}...`,
      });

      await tx.wait();

      toast.current?.show({
        severity: "success",
        summary: "Will created",
        detail: "Your testament has been registered.",
      });
    } catch (err: any) {
      console.error("Create Will failed:", err);
      toast.current?.show({
        severity: "error",
        summary: "Create Will failed",
        detail: err?.reason ?? err?.message ?? "See console for details.",
      });
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Button
        label="Save Will"
        icon="pi pi-check"
        className="w-full"
        disabled={beneficiaries.length === 0}
        onClick={handleCreate}
      />
    </>
  );
}
