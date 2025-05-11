import { useState, useRef } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Contract, BrowserProvider, type Eip1193Provider } from "ethers";
import { useAppKitProvider, useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import VaultArtifact from "../abi/Vault.json";
import { vaultAddress } from "../lib/constants";
import { arbitrumSepolia } from "@reown/appkit/networks"

interface DistributeButtonProps {
  creator?: string | null;
  onSuccess?: () => void;
  disabled?: boolean;
}

export function DistributeButton({ creator, onSuccess, disabled }: DistributeButtonProps) {
  const { walletProvider } = useAppKitProvider<Eip1193Provider>("eip155");
  const { isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);

  const handleDistribute = async () => {
    if (!walletProvider || !isConnected) {
      toast.current?.show({ severity: "warn", summary: "Wallet not connected" });
      return;
    }

    if (chainId !== arbitrumSepolia.id) {
      return;
    }

    setLoading(true);

    try {
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const contract = new Contract(vaultAddress, VaultArtifact.abi, signer);

      const fee: bigint = await contract.quoteRequestWill(creator);
      const txRequest = await contract.requestWill(creator, { value: fee });
      await txRequest.wait();

      // Wait for WillReceived event
      await new Promise<void>((resolve, reject) => {
        const filter = contract.filters.WillReceived(creator);
        contract.once(filter, (available: boolean) => {
          if (available) {
            resolve();
          } else {
            reject(new Error("Will is still not available."));
          }
        });
      });

      const txDistribute = await contract.distribute(creator);
      await txDistribute.wait();

      toast.current?.show({ severity: "success", summary: "ETH distributed successfully" });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Error during distribution:", err);
      toast.current?.show({ severity: "error", summary: "Distribution failed", detail: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Button
        label="Distribute"
        className="w-full"
        onClick={handleDistribute}
        loading={loading}
        disabled={disabled || chainId !== arbitrumSepolia.id}
      />
    </>
  );
}
