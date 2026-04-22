// OrbitControls a été abandonné car son damping interne crée un feedback loop
// instable avec le useFrame priority 1 chargé de fixer la position : OrbitControls
// recalcule le target à chaque frame depuis sa propre vélocité, et le useFrame le
// réécrit immédiatement après — causant un drift progressif du target vers le bas.
// On gère donc le drag manuellement en coordonnées sphériques avec lerp explicite.
import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { room360State } from '@/hooks/useRoom360'

const EYE_HEIGHT = 1.6
const SENSITIVITY = 0.005
const PHI_MIN = Math.PI / 9
const PHI_MAX = Math.PI - Math.PI / 9
const DAMPING = 0.1

export default function CameraControls() {
  const { camera, gl } = useThree()

  // theta = azimut horizontal, phi = polar vertical
  // theta: Math.PI → regarde vers -Z au départ
  const sph = useRef({ theta: Math.PI, phi: Math.PI / 2 })
  const tgt = useRef({ theta: Math.PI, phi: Math.PI / 2 })
  const lookVec = useRef(new THREE.Vector3())

  useEffect(() => {
    const canvas = gl.domElement
    let dragging = false
    let lastX = 0
    let lastY = 0

    room360State.setTheta = (v) => { tgt.current.theta = v }
    room360State.setPhi   = (v) => { tgt.current.phi = Math.max(PHI_MIN, Math.min(PHI_MAX, v)) }

    function onPointerDown(e: PointerEvent) {
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
      canvas.setPointerCapture(e.pointerId)
    }

    function onPointerMove(e: PointerEvent) {
      if (!dragging) return
      tgt.current.theta -= (e.clientX - lastX) * SENSITIVITY
      tgt.current.phi    = Math.max(PHI_MIN, Math.min(PHI_MAX,
        tgt.current.phi - (e.clientY - lastY) * SENSITIVITY
      ))
      lastX = e.clientX
      lastY = e.clientY
    }

    function onPointerUp(e: PointerEvent) {
      dragging = false
      canvas.releasePointerCapture(e.pointerId)
    }

    let lastTX = 0
    let lastTY = 0

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 1) {
        lastTX = e.touches[0].clientX
        lastTY = e.touches[0].clientY
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length !== 1) return
      e.preventDefault()
      tgt.current.theta -= (e.touches[0].clientX - lastTX) * SENSITIVITY
      tgt.current.phi    = Math.max(PHI_MIN, Math.min(PHI_MAX,
        tgt.current.phi - (e.touches[0].clientY - lastTY) * SENSITIVITY
      ))
      lastTX = e.touches[0].clientX
      lastTY = e.touches[0].clientY
    }

    canvas.addEventListener('pointerdown',   onPointerDown)
    canvas.addEventListener('pointermove',   onPointerMove)
    canvas.addEventListener('pointerup',     onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
    canvas.addEventListener('touchstart',    onTouchStart, { passive: true })
    canvas.addEventListener('touchmove',     onTouchMove,  { passive: false })

    return () => {
      canvas.removeEventListener('pointerdown',   onPointerDown)
      canvas.removeEventListener('pointermove',   onPointerMove)
      canvas.removeEventListener('pointerup',     onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      canvas.removeEventListener('touchstart',    onTouchStart)
      canvas.removeEventListener('touchmove',     onTouchMove)
    }
  }, [gl])

  useFrame(({ camera: cam }) => {
    sph.current.theta += (tgt.current.theta - sph.current.theta) * DAMPING
    sph.current.phi   += (tgt.current.phi   - sph.current.phi)   * DAMPING

    const { theta, phi } = sph.current
    const sinPhi = Math.sin(phi)

    lookVec.current.set(
      sinPhi * Math.sin(theta),
      Math.cos(phi) + EYE_HEIGHT,
      sinPhi * Math.cos(theta)
    )

    cam.position.set(0, EYE_HEIGHT, 0)
    cam.lookAt(lookVec.current)
  })

  return null
}
