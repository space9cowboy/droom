import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import type { ReactNode } from 'react'

interface SceneProps {
  children?: ReactNode
}

export default function Scene({ children }: SceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 1.6, 0] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.0
      }}
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh' }}
    >
      <ambientLight intensity={0.5} />
      <mesh position={[0, 1.6, -3]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4a90d9" />
      </mesh>

      {children}
    </Canvas>
  )
}
