import { useAppKitNetwork } from "@reown/appkit/react"
import { useEffect } from "react"
import { sapphireTestnet, arbitrumSepolia } from "@reown/appkit/networks"

export function useSapphireTestnet() {
  const { switchNetwork, chainId } = useAppKitNetwork();

  useEffect(() => {
    if (chainId === sapphireTestnet.id) return;
    switchNetwork(sapphireTestnet);
  }, []);
}

export function useArbitrumSepolia() {
  const { switchNetwork, chainId } = useAppKitNetwork();

  useEffect(() => {
    if (chainId === arbitrumSepolia.id) return;
    switchNetwork(arbitrumSepolia);
  }, []);
}
