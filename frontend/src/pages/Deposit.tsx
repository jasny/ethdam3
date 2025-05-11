import { Card } from "primereact/card";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { useState } from "react";
import { useEthBalance } from "../hooks/useEthBalance.ts"
import { DepositButton } from "../components/DepositButton.tsx"
import { useVaultBalance } from "../hooks/useVaultBalance.ts"
import { Skeleton } from "primereact/skeleton"
import { WithdrawButton } from "../components/WithdrawButton.tsx"
import { useArbitrumSepolia } from "../hooks/useNetwork.ts"

export default function Deposit() {
  useArbitrumSepolia();

  const [amount, setAmount] = useState<number | null>(null);

  const { balance: ethBalance, max: ethMax, refetch: refetchEthBalance } = useEthBalance();
  const { balance: vaultBalance, refetch: refetchVaultBalance } = useVaultBalance();

  const refresh = () => {
    setTimeout(() => {
      refetchEthBalance().then();
      refetchVaultBalance().then();
    }, 1000);
  }

  return (
    <div className="flex flex-column justify-content-center align-items-center" style={{ marginTop: "100px" }}>
      <Card title="Balance" className="mb-4 w-30rem">
        <div className="grid">
          {vaultBalance === null ? (
            <div className="col-12">
              <div className="flex align-items-center justify-content-center" style={{ height: "4rem" }}>
                <Skeleton width="8rem" height="2rem" />
              </div>
            </div>
          ) : <>
            <div className="col-12">
              <div className="text-center text-2xl font-bold">{vaultBalance} ETH</div>
            </div>
            <div className="col-12">
              <WithdrawButton disabled={vaultBalance === 0} onSuccess={() => refresh()} />
            </div>
          </>}
        </div>
      </Card>

      <Card title="Deposit ETH" className="w-30rem">
        <div className="grid">
          <div className="col-12">
            <label htmlFor="amount" className="font-bold block mb-2 w-max">
              Amount (Balance: {ethBalance?.replace(/(\.\d\d)\d+/, '$1')} ETH)
            </label>
            <div className="p-inputgroup">
              <InputNumber
                id="amount"
                value={amount}
                onValueChange={(e) => setAmount(e.value ?? null)}
                mode="decimal"
                min={0}
                minFractionDigits={1}
                maxFractionDigits={5}
                suffix=' ETH'
                placeholder="Enter amount"
                className="w-full"
              />
              <Button label="Max" severity='success' onClick={() => setAmount(ethMax)} />
            </div>
          </div>

          <div className="col-12 mt-4">
            <DepositButton amount={amount} onSuccess={() => refresh()} />
          </div>
        </div>
      </Card>
    </div>
  );
}
