import { useStore } from '@/store/useStore'
import type { StoreState } from '@/store/useStore'
import { Tooltip } from './Tooltip'

export default function UI() {
  const tooltipLabel = useStore((s: StoreState) => s.tooltipLabel)
  const tooltipVisible = useStore((s: StoreState) => s.tooltipVisible)

  return <Tooltip label={tooltipLabel} visible={tooltipVisible} />
}
