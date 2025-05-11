import { useTestamentExpiry } from "../hooks/useTestamentExpiry.ts"
import { PingButton } from "../components/PingButton.tsx"
import { TestamentCountdown } from "../components/TestamentCountdown.tsx"
import { useSapphireTestnet } from "../hooks/useNetwork.ts"

export default function Ping() {
  const { expiry, refetch } = useTestamentExpiry()
  useSapphireTestnet()

  return (
    <div className="flex flex-column justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 100px)' }}>
      {expiry && (
        <div className="mb-4 text-xl">
          Next ping due in<br />
          <TestamentCountdown expiry={expiry} />
        </div>
      )}

      <PingButton refetch={refetch}/>
    </div>
  )
}
