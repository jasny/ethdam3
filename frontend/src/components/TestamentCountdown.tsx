import { useEffect, useState } from "react";

export function TestamentCountdown({ expiry }: { expiry: number | null }) {
  const nextPingDue = expiry !== null ? new Date(expiry * 1000) : null;
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft> | null>(null);

  useEffect(() => {
    if (!nextPingDue) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(nextPingDue));
    }, 1000);

    return () => clearInterval(interval);
  }, [nextPingDue]);

  if (!timeLeft) return null;

  return timeLeft.total > 0
    ? <span className="font-bold">{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
    : <span className="font-bold">NOW!</span>
}

// helper function
function getTimeLeft(targetDate: Date) {
  const total = Math.max(0, targetDate.getTime() - Date.now());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { total, days, hours, minutes, seconds };
}
