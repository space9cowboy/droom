import { useCallback, useEffect, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'

interface UseInteractionOptions {
  onHoverIn?: () => void
  onHoverOut?: () => void
  onClick?: () => void
}

/**
 * Centralise le raycasting hover/click sur un mesh R3F.
 *
 * @example
 * ```tsx
 * const { hovered, onPointerOver, onPointerOut, onClick } = useInteraction({
 *   onClick: () => console.log('cliqué !'),
 * })
 * return (
 *   <mesh onPointerOver={onPointerOver} onPointerOut={onPointerOut} onClick={onClick}>
 *     <boxGeometry />
 *     <meshStandardMaterial color="white" emissive="white" emissiveIntensity={hovered ? 0.15 : 0} />
 *   </mesh>
 * )
 * ```
 */
export function useInteraction(options: UseInteractionOptions) {
  const [hovered, setHovered] = useState(false)

  // Reset cursor if component unmounts while hovered
  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [])

  const onPointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      document.body.style.cursor = 'pointer'
      setHovered(true)
      options.onHoverIn?.()
    },
    [options],
  )

  const onPointerOut = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      document.body.style.cursor = 'auto'
      setHovered(false)
      options.onHoverOut?.()
    },
    [options],
  )

  const onClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      options.onClick?.()
    },
    [options],
  )

  return { hovered, onPointerOver, onPointerOut, onClick }
}
