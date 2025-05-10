import { Button } from 'primereact/button'
import { useEffect, useState } from "react"

export default function Ping() {
  const [nextPingDue] = useState(() => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(nextPingDue))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(nextPingDue))
    }, 1000)

    return () => clearInterval(interval)
  }, [nextPingDue])

  return (
    <div className="flex flex-column justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 100px)' }}>
      <div className="mb-4 text-xl">
        Next ping due in<br />
        <span className="font-bold">{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
      </div>

      <Button
        label="I'm still alive"
        icon="pi pi-heart"
        className="p-button-lg"
        onClick={() => alert("You are still alive!")}
      />
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
