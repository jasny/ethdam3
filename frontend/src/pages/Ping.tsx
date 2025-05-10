import { useEffect, useState } from "react"
import { useTestamentExpiry } from "../hooks/useTestamentExpiry.ts"
import { PingButton } from "../components/PingButton.tsx"
import { sapphireTestnet } from "@reown/appkit/networks";
import { useAppKitNetwork } from "@reown/appkit/react"

export default function Ping() {
  const { expiry, refetch } = useTestamentExpiry()
  const nextPingDue = expiry ? new Date(expiry * 1000) : null

  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft> | null>(null)
  const { switchNetwork, chainId } = useAppKitNetwork();

  useEffect(() => {
    switchNetwork(sapphireTestnet);
  }, [switchNetwork]);

  useEffect(() => {
    if (chainId !== sapphireTestnet.id || nextPingDue === null) {
      setTimeLeft(null)
      return
    }

    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(nextPingDue))
    }, 1000)

    return () => clearInterval(interval)
  }, [nextPingDue, chainId])

  return (
    <div className="flex flex-column justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 100px)' }}>
      {timeLeft && (
        <div className="mb-4 text-xl">
          Next ping due in<br />
          { timeLeft.total > 0
            ? <span className="font-bold">{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
            : <span className="font-bold">NOW!</span>
          }
        </div>
      )}

      <PingButton refetch={refetch}/>
    </div>
  )
}

function getTimeLeft(targetDate: Date) {
  const total = Math.max(0, targetDate.getTime() - Date.now())

  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))

  return { total, days, hours, minutes, seconds }
}
