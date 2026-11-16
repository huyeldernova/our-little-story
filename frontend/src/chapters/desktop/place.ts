import type { CSSProperties } from 'react'

type Box = { left?: number; right?: number; top?: number; bottom?: number; width?: number; height?: number }

const pct = (v: number, of: number) => `${+((v / of) * 100).toFixed(3)}%`

/**
 * The 1440px canvases place collage items in absolute pixels inside a box of known size.
 * place(W, H) turns those pixel boxes into percentages of a W:H container, so the collage
 * scales down between 1024 and 1440px instead of overflowing.
 */
export function place(W: number, H: number) {
  const frame: CSSProperties = { position: 'relative', width: '100%', aspectRatio: `${W} / ${H}` }
  const at = (b: Box): CSSProperties => {
    const o: CSSProperties = { position: 'absolute' }
    if (b.left !== undefined) o.left = pct(b.left, W)
    if (b.right !== undefined) o.right = pct(b.right, W)
    if (b.width !== undefined) o.width = pct(b.width, W)
    if (b.top !== undefined) o.top = pct(b.top, H)
    if (b.bottom !== undefined) o.bottom = pct(b.bottom, H)
    if (b.height !== undefined) o.height = pct(b.height, H)
    return o
  }
  return { frame, at }
}
