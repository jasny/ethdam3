import { useTestamentExpiry } from "../hooks/useTestamentExpiry.ts";
import { useVaultBalance } from "../hooks/useVaultBalance.ts";
import { useTestamentWill } from "../hooks/useTestamentWill.ts";
import { TestamentCountdown } from "../components/TestamentCountdown.tsx";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Skeleton } from "primereact/skeleton";
import backgroundImage from "../assets/testament-bg.jpg";
import { DistributeButton } from "../components/DistributeButton.tsx"
import { useArbitrumSepolia } from "../hooks/useNetwork.ts"

export default function DistributeDetail() {
  useArbitrumSepolia();

  const { address } = useParams<{ address: string }>();
  const { expiry } = useTestamentExpiry(address);
  const { balance, refetch: refetchBalance } = useVaultBalance(address);
  const { heirs, points, message, loading: willLoading } = useTestamentWill(address);

  const [isAvailable, setIsAvailable] = useState(false);

  const refresh = () => {
    setTimeout(() => {
      refetchBalance().then();
    }, 1000);
  }

  useEffect(() => {
    const available = expiry !== null && (expiry * 1000) - Date.now() <= 0;
    setIsAvailable(available);

    if (!available && expiry) {
      const timeout = setTimeout(() => setIsAvailable(true), (expiry * 1000) - Date.now() + 1000);
      return () => clearTimeout(timeout);
    }
  }, [expiry]);

  return (
    <div className="flex flex-column justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 100px)', marginTop: '64px' }}>
      { !isAvailable && expiry && (
        <div className="mb-4 text-xl">
          Testament will be made public in<br />
          <TestamentCountdown expiry={expiry} />
        </div>
      )}

      { isAvailable && (
        <>
          <Card className="w-max mb-8" style={{ maxWidth: '600px' }} header={<img alt="Card" src={backgroundImage} />}>
            { message === null ? (
              <Skeleton height="2rem" className="mb-3" />
            ) : (
              <div style={{ whiteSpace: 'pre-wrap' }}>{message}</div>
            )}
          </Card>

          <Card
            title="Beneficiaries"
            style={{ width: 'calc(100% - 4rem)', maxWidth: '1000px' }}
            footer={<DistributeButton creator={address} disabled={balance === 0} onSuccess={() => refresh()} />}
          >
            { balance === null ? (
              <Skeleton height="2rem" className="mb-3" />
            ) : (
              <div className="text-xl mb-4">
                <b>Total Vault Balance:</b> {balance > 0 ? <>{balance.toFixed(4)} ETH</> : <>&mdash;</>}
              </div>
            )}

            { willLoading || !heirs ? (
              <Skeleton height="10rem" />
            ) : (
              <DataTable value={heirs.map(h => ({
                heir: h.heir,
                percentage: (points && points > 0)
                  ? (Number(h.points) / Number(points)) * 100
                  : 0,
                share: (points && balance !== null)
                  ? (Number(h.points) / Number(points)) * balance
                  : 0
              }))} showGridlines>
                <Column field="heir" header="Address" style={{ wordBreak: "break-all" }} />
                <Column field="percentage" header="Share" body={(row) => row.percentage.toFixed(1) + ' %'} />
                <Column field="share" header="ETH" body={(row) => row.share.toFixed(4)} />
              </DataTable>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
