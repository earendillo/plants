'use client'

import { useRef, useState } from 'react'

const LONG_PRESS_MS = 600
const MOVE_TOLERANCE_PX = 10

function suppressBodySelect() {
  document.body.style.userSelect = 'none'
  ;(document.body.style as React.CSSProperties).WebkitUserSelect = 'none'
}

function restoreBodySelect() {
  document.body.style.userSelect = ''
  ;(document.body.style as React.CSSProperties).WebkitUserSelect = undefined
}

export function useLongPress(enabled: boolean) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [pressing, setPressing] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressedRef = useRef(false)
  const startPosRef = useRef<{ x: number; y: number } | null>(null)

  function handlePointerDown(e: React.PointerEvent) {
    if (!enabled) return
    longPressedRef.current = false
    setPressing(true)
    startPosRef.current = { x: e.clientX, y: e.clientY }
    suppressBodySelect()
    timerRef.current = setTimeout(() => {
      longPressedRef.current = true
      setPressing(false)
      restoreBodySelect()
      setMenuOpen(true)
    }, LONG_PRESS_MS)
  }

  function cancelTimer() {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    restoreBodySelect()
    setPressing(false)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!startPosRef.current || timerRef.current === null) return
    const dx = e.clientX - startPosRef.current.x
    const dy = e.clientY - startPosRef.current.y
    if (Math.abs(dx) > MOVE_TOLERANCE_PX || Math.abs(dy) > MOVE_TOLERANCE_PX) cancelTimer()
  }

  // iOS Safari fires pointercancel during long-press detection — don't cancel the timer,
  // only clear the visual pressing state so the card doesn't stay "pressed"
  function handlePointerCancel() {
    restoreBodySelect()
    setPressing(false)
  }

  function handleClick(e: React.MouseEvent) {
    if (longPressedRef.current) {
      e.preventDefault()
      longPressedRef.current = false
    }
  }

  const handlers = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: cancelTimer,
    onPointerLeave: cancelTimer,
    onPointerCancel: handlePointerCancel,
    onClick: handleClick,
    onContextMenu: (e: React.MouseEvent) => { if (enabled) e.preventDefault() },
  } as const

  return { menuOpen, setMenuOpen, pressing, longPressedRef, handlers }
}
