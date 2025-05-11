import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { BrowserProvider, parseEther, type Eip1193Provider } from "ethers";
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from "@reown/appkit/react";
import { vaultAddress } from "../lib/constants";
import { arbitrumSepolia } from "@reown/appkit/networks"

interface DepositButtonProps {
  amount: number | null;
  onSuccess?: () => void;
}

export function DepositButton({ amount, onSuccess }: DepositButtonProps) {
  const toast = useRef<Toast>(null);
  const { chainId } = useAppKitNetwork();
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Eip1193Provider>("eip155");

  const handleDeposit = async () => {
    if (!walletProvider || !isConnected) {
      toast.current?.show({
        severity: "warn",
        summary: "Wallet not connected",
        detail: "Please connect your wallet first.",
      });
      return;
    }

    if (!amount || amount <= 0 || chainId !== arbitrumSepolia.id) {
      return;
    }

    try {
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner(address);

      const tx = await signer.sendTransaction({
        to: vaultAddress,
        value: parseEther(amount.toString()),
      });

      toast.current?.show({
        severity: "info",
        summary: "Transaction sent",
        detail: `Hash: ${tx.hash}`,
      });

      await tx.wait();

      toast.current?.show({
        severity: "success",
        summary: "Deposit successful",
        detail: `Hash: ${tx.hash}`,
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Deposit failed",
        detail: error.message ?? "Unknown error",
      });
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Button
        label="Deposit"
        icon="pi pi-download"
        className="w-full"
        disabled={!amount || amount <= 0 || chainId !== arbitrumSepolia.id}
        onClick={handleDeposit}
      />
    </>
  );
}
