import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Noise, Vignette, ToneMapping } from '@react-three/postprocessing'
import { useDayNight } from '@/hooks/useDayNight'

const DAY = { bloom: 0.3, grain: 0.03, vignette: 0.3 } as const
const NIGHT = { bloom: 0.6, grain: 0.1, vignette: 0.5 } as const

// Structural interfaces — only the mutable properties we need from each effect instance
interface BloomHandle { intensity: number }
interface NoiseHandle { blendMode: { opacity: { value: number } } }
interface VignetteHandle { darkness: number }

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export default function PostProcessing() {
  const { progressRef } = useDayNight()
  const bloomRef = useRef<BloomHandle>(null)
  const noiseRef = useRef<NoiseHandle>(null)
  const vignetteRef = useRef<VignetteHandle>(null)

  useFrame(() => {
    const t = progressRef.current
    if (bloomRef.current) bloomRef.current.intensity = lerp(DAY.bloom, NIGHT.bloom, t)
    if (noiseRef.current) noiseRef.current.blendMode.opacity.value = lerp(DAY.grain, NIGHT.grain, t)
    if (vignetteRef.current) vignetteRef.current.darkness = lerp(DAY.vignette, NIGHT.vignette, t)
  })

  return (
    <EffectComposer>
      {/* @react-three/postprocessing types refs as `typeof Effect` (constructor) not instance — `never` cast required */}
      <Bloom ref={bloomRef as unknown as never} intensity={DAY.bloom} />
      <Noise ref={noiseRef as unknown as never} opacity={DAY.grain} />
      <Vignette ref={vignetteRef as unknown as never} darkness={DAY.vignette} />
      <ToneMapping />
    </EffectComposer>
  )
}
