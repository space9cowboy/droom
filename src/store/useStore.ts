import { create } from 'zustand'

export interface StoreState {
  isPlaying: boolean
  timeOfDay: 'day' | 'night'
  activeZone: string | null
  openPanel: string | null
  tooltipLabel: string
  tooltipVisible: boolean
  setIsPlaying: (v: boolean) => void
  setTimeOfDay: (v: 'day' | 'night') => void
  setActiveZone: (v: string | null) => void
  setOpenPanel: (v: string | null) => void
  setTooltip: (label: string, visible: boolean) => void
}

export const useStore = create<StoreState>((set) => ({
  isPlaying: false,
  timeOfDay: 'day',
  activeZone: null,
  openPanel: null,
  tooltipLabel: '',
  tooltipVisible: false,
  setIsPlaying: (v) => set({ isPlaying: v }),
  setTimeOfDay: (v) => set({ timeOfDay: v }),
  setActiveZone: (v) => set({ activeZone: v }),
  setOpenPanel: (v) => set({ openPanel: v }),
  setTooltip: (label, visible) => set({ tooltipLabel: label, tooltipVisible: visible }),
}))
