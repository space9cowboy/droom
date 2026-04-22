import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  HemisphereLight,
  DirectionalLight,
  RectAreaLight,
} from 'three'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib'

RectAreaLightUniformsLib.init()

interface Props {
  progressRef: React.MutableRefObject<number>
}

export default function DayLights({ progressRef }: Props) {
  const hemiRef = useRef<HemisphereLight>(null)
  const dirRef = useRef<DirectionalLight>(null)
  const rectRef = useRef<RectAreaLight>(null)

  useFrame(() => {
    const scale = 1 - progressRef.current
    if (hemiRef.current) hemiRef.current.intensity = 0.4 * scale
    if (dirRef.current) dirRef.current.intensity = 2.5 * scale
    if (rectRef.current) rectRef.current.intensity = 4 * scale
  })

  return (
    <>
      {/* Sky dome — blue sky above, warm earth below */}
      <hemisphereLight ref={hemiRef} args={['#87CEEB', '#8B7355', 0.4]} />

      {/* Golden-hour sun — low angle from north-west, casts shadows */}
      <directionalLight
        ref={dirRef}
        color="#FFF5E0"
        intensity={2.5}
        position={[3, 4, -2]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />

      {/* North bay window — cold diffuse blue bleeding in from outside */}
      <rectAreaLight
        ref={rectRef}
        color="#B8D4FF"
        intensity={4}
        width={5}
        height={2.2}
        position={[0, 1.8, -2.9]}
        rotation={[0, Math.PI, 0]}
      />
    </>
  )
}
