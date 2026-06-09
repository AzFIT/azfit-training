import { useState, useEffect } from 'react'
import { MS_PER_MINUTE } from '../constants'

export function useCurrentTime() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), MS_PER_MINUTE)
    return () => clearInterval(timer)
  }, [])
  return now
}
