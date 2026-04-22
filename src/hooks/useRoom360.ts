// Module-level singleton — shared between CameraControls and any consumer
export const room360State: {
  setTheta: (theta: number) => void
  setPhi:   (phi:   number) => void
} = {
  setTheta: () => {},
  setPhi:   () => {},
}

export function useRoom360() {
  return room360State
}
