import { useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { room360ControlsRef } from '@/hooks/useRoom360'

const EYE_HEIGHT = 1.6
const EYE_POSITION = new THREE.Vector3(0, EYE_HEIGHT, 0)

export default function CameraControls() {
  const { camera } = useThree()

  // Ensure camera starts looking North (–Z) at eye height
  useEffect(() => {
    camera.position.copy(EYE_POSITION)
    camera.lookAt(0, EYE_HEIGHT, -1)
  }, [camera])

  // Priority 1 → runs after OrbitControls (priority 0)
  // Locks camera position and keeps target exactly 1 unit ahead
  useFrame(() => {
    if (!room360ControlsRef.current) return

    const dir = new THREE.Vector3()
    camera.getWorldDirection(dir)

    camera.position.copy(EYE_POSITION)
    room360ControlsRef.current.target
      .copy(EYE_POSITION)
      .addScaledVector(dir, 1)
  }, 1)

  return (
    <OrbitControls
      ref={(instance) => { room360ControlsRef.current = instance }}
      makeDefault
      enablePan={false}
      enableZoom={false}
      enableDamping
      dampingFactor={0.05}
      minPolarAngle={Math.PI / 9}
      maxPolarAngle={Math.PI - Math.PI / 9}
      // 360° horizontal libre — pas de minAzimuthAngle / maxAzimuthAngle
    />
  )
}
