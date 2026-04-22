import { Suspense, useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

function RoomModel() {
  const { scene } = useGLTF('/models/room_shell.glb')
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    scene.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return

      node.castShadow = true
      node.receiveShadow = true

      const mats = Array.isArray(node.material) ? node.material : [node.material]
      mats.forEach((mat) => {
        if (mat instanceof THREE.Material) {
          mat.side = THREE.DoubleSide
        }
      })
    })
  }, [scene])

  return <primitive ref={groupRef} object={scene} />
}

export default function Room() {
  return (
    <Suspense fallback={null}>
      <RoomModel />
    </Suspense>
  )
}

useGLTF.preload('/models/room_shell.glb')
