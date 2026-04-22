import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshBasicMaterial, Color } from 'three'

// TODO: when public/hdri/day.hdr + night.hdr land, replace with:
//   const envDay  = useEnvironment({ files: '/hdri/day.hdr' })
//   const envNight = useEnvironment({ files: '/hdri/night.hdr' })
// Then in useFrame swap at threshold:
//   scene.environment = progressRef.current < 0.5 ? envDay : envNight
// (smooth crossfade of scene.environment is not possible in Three.js —
//  swapping at 0.5 is the accepted approach for HDR env maps)

interface Props {
  progressRef: React.MutableRefObject<number>
}

const colorDay = new Color('#87CEEB')
const colorNight = new Color('#0A0A1A')

export default function SkyBox({ progressRef }: Props) {
  const { scene } = useThree()
  const matRef = useRef<MeshBasicMaterial>(null)

  useEffect(() => {
    // No global background — opaque walls hide the sky,
    // only the north bay window glass lets it through
    scene.background = null
    return () => { scene.background = null }
  }, [scene])

  useFrame(() => {
    if (matRef.current) {
      matRef.current.color.lerpColors(colorDay, colorNight, progressRef.current)
    }
  })

  // Plane aligned with the north bay window: 5 × 2.2 m, centred at window height
  return (
    <mesh position={[0, 1.8, -2.95]}>
      <planeGeometry args={[5, 2.2]} />
      <meshBasicMaterial ref={matRef} color={colorDay} />
    </mesh>
  )
}
