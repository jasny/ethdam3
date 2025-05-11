import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useAppKitProvider, useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { BrowserProvider, Contract, type Eip1193Provider } from "ethers";
import { useRef } from "react";
import VaultArtifact from "../abi/Vault.json";
import { vaultAddress } from "../lib/constants";
import { arbitrumSepolia } from "@reown/appkit/networks"

export function WithdrawButton({ disabled, onSuccess }: { disabled?: boolean, onSuccess: () => void }) {
  const { walletProvider } = useAppKitProvider<Eip1193Provider>("eip155");
  const { isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const toast = useRef<Toast>(null);

  const handleWithdraw = async () => {
    if (!isConnected || !walletProvider) {
      toast.current?.show({
        severity: "warn",
        summary: "Not Connected",
        detail: "Please connect your wallet first.",
        life: 3000,
      });
      return;
    }

    if (chainId !== arbitrumSepolia.id) {
      return;
    }

    try {
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const contract = new Contract(vaultAddress, VaultArtifact.abi, signer);

      const tx = await contract.withdraw();
      await tx.wait();

      toast.current?.show({
        severity: "success",
        summary: "Withdraw Successful",
        detail: "Your assets have been withdrawn from the Vault.",
        life: 3000,
      });

      onSuccess();
    } catch (err: any) {
      console.error("Withdraw failed:", err);
      toast.current?.show({
        severity: "error",
        summary: "Withdraw Failed",
        detail: err.message ?? "An unexpected error occurred.",
        life: 3000,
      });
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Button
        label="Withdraw"
        icon="pi pi-upload"
        className="w-full"
        severity="secondary"
        outlined
        disabled={disabled || chainId !== arbitrumSepolia.id}
        onClick={handleWithdraw}
      />
    </>
  );
}
