import { useDayNight } from '@/hooks/useDayNight'
import DayLights from './DayLights'
import NightLights from './NightLights'
import SkyBox from './SkyBox'

export default function DayNightCycle() {
  const { progressRef } = useDayNight()

  return (
    <>
      <SkyBox progressRef={progressRef} />
      <DayLights progressRef={progressRef} />
      <NightLights progressRef={progressRef} />
    </>
  )
}
