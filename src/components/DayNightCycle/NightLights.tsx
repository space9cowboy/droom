import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  HemisphereLight,
  PointLight,
  SpotLight as SpotLightImpl,
} from 'three'

interface Props {
  progressRef: React.MutableRefObject<number>
}

export default function NightLights({ progressRef }: Props) {
  const hemiRef = useRef<HemisphereLight>(null)
  const deskRef = useRef<PointLight>(null)
  const screenRef = useRef<PointLight>(null)
  const spotRef = useRef<SpotLightImpl>(null)
  const { scene } = useThree()

  useEffect(() => {
    if (!spotRef.current) return
    const target = spotRef.current.target
    target.position.set(-2, 0, 1.5)
    scene.add(target)
    return () => { scene.remove(target) }
  }, [scene])

  useFrame(() => {
    const scale = progressRef.current
    if (hemiRef.current) hemiRef.current.intensity = 0.1 * scale
    if (deskRef.current) deskRef.current.intensity = 3 * scale
    if (screenRef.current) screenRef.current.intensity = 1 * scale
    if (spotRef.current) spotRef.current.intensity = 2 * scale
  })

  return (
    <>
      {/* Near-zero ambient — deep night sky */}
      <hemisphereLight ref={hemiRef} args={['#0A0A1A', '#1A1008', 0.1]} />

      {/* Desk lamp — warm incandescent, south-east corner */}
      <pointLight
        ref={deskRef}
        color="#FFD084"
        intensity={3}
        distance={4}
        decay={2}
        position={[1.5, 1.2, 1.5]}
      />

      {/* PC screens — cold blue glow, south-west gaming corner */}
      <pointLight
        ref={screenRef}
        color="#8AB4F8"
        intensity={1}
        distance={3}
        decay={2}
        position={[-2, 1.0, 1.5]}
      />

      {/* Under-desk LED strip — pink accent toward floor */}
      <spotLight
        ref={spotRef}
        color="#FF6B9D"
        intensity={2}
        distance={2}
        angle={Math.PI / 4}
        penumbra={0.5}
        position={[-2, 0.3, 1.5]}
      />
    </>
  )
}
