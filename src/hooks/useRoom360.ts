import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

// Module-level singleton — shared between CameraControls and any consumer
export const room360ControlsRef: { current: OrbitControlsImpl | null } = { current: null }

export function useRoom360() {
  return room360ControlsRef
}
