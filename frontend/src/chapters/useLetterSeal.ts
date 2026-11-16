import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import type { LetterSeal } from './types'

const HOLD_MS = 1300
const PULL_MAX = 260
const PULL_OPEN = 110

/**
 * Wax-seal interaction shared by the mobile and desktop letter chapters.
 * The seal state itself (sealed / cracking / peek / out) lives in StoryLayout,
 * so switching layouts keeps the letter where it was; only the transient
 * hold progress and drag offset are local.
 */
export function useLetterSeal(seal: LetterSeal, setSeal: (s: LetterSeal) => void) {
  const [hold, setHold] = useState(0)
  const [pull, setPull] = useState(0)
  const [dragging, setDragging] = useState(false)
  const holdTimer = useRef<number | undefined>(undefined)
  const pullRef = useRef<{ y: number; s: number } | null>(null)

  useEffect(() => () => window.clearInterval(holdTimer.current), [])

  const breakSeal = () => {
    window.clearInterval(holdTimer.current)
    try {
      navigator.vibrate?.([18, 40, 30])
    } catch {
      // vibration not supported
    }
    setHold(100)
    setSeal('cracking')
    window.setTimeout(() => {
      setSeal('peek')
      setHold(0)
    }, 550)
  }
  const holdStart = (e: PointerEvent) => {
    if (seal !== 'sealed') return
    e.preventDefault()
    const t0 = Date.now()
    window.clearInterval(holdTimer.current)
    holdTimer.current = window.setInterval(() => {
      const pr = Math.min(100, ((Date.now() - t0) / HOLD_MS) * 100)
      if (pr >= 100) breakSeal()
      else setHold(pr)
    }, 30)
  }
  const holdEnd = () => {
    if (seal === 'sealed') {
      window.clearInterval(holdTimer.current)
      setHold(0)
    }
  }
  const holdKey = (e: KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && seal === 'sealed') {
      e.preventDefault()
      breakSeal()
    }
  }
  const noMenu = (e: { preventDefault: () => void }) => e.preventDefault()
  const pullStart = (e: PointerEvent<HTMLElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    pullRef.current = { y: e.clientY, s: r.height / (el.offsetHeight || r.height) || 1 }
    try {
      el.setPointerCapture(e.pointerId)
    } catch {
      // ignore
    }
    setDragging(true)
  }
  const pullMove = (e: PointerEvent) => {
    if (!pullRef.current) return
    setPull(Math.round(Math.max(-PULL_MAX, Math.min(0, (e.clientY - pullRef.current.y) / pullRef.current.s))))
  }
  const pullEnd = () => {
    if (!pullRef.current) return
    pullRef.current = null
    setDragging(false)
    if (pull < -PULL_OPEN) setSeal('out')
    setPull(0)
  }
  const takeOut = () => {
    setSeal('out')
    setPull(0)
  }
  const foldBack = () => {
    setSeal('sealed')
    setHold(0)
    setPull(0)
  }

  return {
    hold, pull, dragging,
    holdStart, holdEnd, holdKey, noMenu,
    pullStart, pullMove, pullEnd, takeOut, foldBack,
    /** SVG ring: circumference of r=52 is ~327. */
    ringOff: String(Math.round(327 - (327 * hold) / 100)),
    sealScale: String(1 - (hold / 100) * 0.12),
    sealClass: seal === 'cracking' ? 'crack' : hold === 0 ? 'pulse' : '',
  }
}
