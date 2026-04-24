import { useEffect, useRef } from 'react'

export interface TooltipProps {
  label: string
  visible: boolean
}

export function Tooltip({ label, visible }: TooltipProps) {
  const divRef = useRef<HTMLDivElement>(null)

  // Update position via direct DOM mutation — avoids re-render on every mousemove
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (divRef.current) {
        divRef.current.style.left = `${e.clientX + 12}px`
        divRef.current.style.top = `${e.clientY + 12}px`
      }
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  return (
    <div
      ref={divRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
        pointerEvents: 'none',
        background: 'rgba(0, 0, 0, 0.75)',
        color: 'white',
        fontSize: '13px',
        fontFamily: 'inherit',
        borderRadius: '4px',
        padding: '4px 10px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 150ms ease-in-out',
      }}
    >
      {label}
    </div>
  )
}
