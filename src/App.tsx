import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import Scene from '@/components/Scene'
import UI from '@/components/UI'

export default function App() {
  return (
    <>
      <Canvas
        style={{ position: 'fixed', inset: 0 }}
        camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 0] }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <UI />
    </>
  )
}
