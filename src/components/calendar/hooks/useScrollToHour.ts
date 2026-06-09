import { useEffect } from 'react'
import { HOUR_HEIGHT } from '../constants'

export function useScrollToHour(
  ref: React.RefObject<HTMLDivElement | null>,
  hour: number,
  trigger?: unknown
) {
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = hour * HOUR_HEIGHT
    }
  }, [ref, hour, trigger])
}
