import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '@/store/useStore'
import type { StoreState } from '@/store/useStore'

export function useDayNight() {
  const timeOfDay = useStore((s: StoreState) => s.timeOfDay)
  const setTimeOfDay = useStore((s: StoreState) => s.setTimeOfDay)
  const progressRef = useRef<number>(timeOfDay === 'night' ? 1 : 0)

  useFrame((_, delta) => {
    const target = timeOfDay === 'night' ? 1 : 0
    const step = delta / 2
    const diff = target - progressRef.current
    progressRef.current += Math.abs(diff) <= step ? diff : Math.sign(diff) * step
  })

  return {
    progressRef,
    isDaytime: timeOfDay === 'day',
    toggle: () => setTimeOfDay(timeOfDay === 'day' ? 'night' : 'day'),
  }
}
