import { useState, useEffect, useRef } from 'react'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setWasOffline(true)
      // Reset wasOffline after 3 seconds (covers syncing + "Sincronizado!" states)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setWasOffline(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      clearTimeout(timerRef.current)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearTimeout(timerRef.current)
    }
  }, [])

  return { isOnline, wasOffline }
}
