import { PerspectiveCamera } from '@react-three/drei'
import Room from '@/components/Room'

export default function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault fov={75} position={[0, 0, 0]} />
      <Room />
    </>
  )
}
