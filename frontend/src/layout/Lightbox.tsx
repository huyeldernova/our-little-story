import { useEffect, useRef } from 'react'
import { assetUrl, type LightboxPhoto } from '../story/StoryContext'

type Props = {
  photos: LightboxPhoto[]
  index: number
  onIndex: (i: number) => void
  onClose: () => void
  t: (k: string) => string
  /** Desktop variant (AboutYou.dc.html): larger card with prev / next beside it. */
  wide?: boolean
}

/** Photo viewer from the design: a polaroid card with prev / next and a counter. */
export default function Lightbox({ photos, index, onIndex, onClose, wide = false }: Props) {
  const n = photos.length
  const cur = photos[Math.min(index, n - 1)]
  const closeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onIndex((index + 1) % n)
      if (e.key === 'ArrowLeft') onIndex((index - 1 + n) % n)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, n, onIndex])

  if (!cur) return null
  const round = { width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(250,247,240,.5)', background: 'transparent', color: '#FAF7F0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } as const

  const prevBtn = (
    <button type="button" onClick={() => onIndex((index - 1 + n) % n)} aria-label="Previous photo" className="d-lbbtn" style={{ ...round, flex: '0 0 auto' }}>
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
    </button>
  )
  const nextBtn = (
    <button type="button" onClick={() => onIndex((index + 1) % n)} aria-label="Next photo" className="d-lbbtn" style={{ ...round, flex: '0 0 auto' }}>
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
    </button>
  )

  if (wide) {
    return (
      <div className="fade" role="dialog" aria-modal="true" aria-label="Photo viewer" data-nonav="1" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(57,52,47,.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, padding: 40, boxSizing: 'border-box', color: '#FAF7F0' }}>
        {prevBtn}
        <div key={index} className="lbcard" style={{ width: 'min(460px, 70%)', background: '#FAF7F0', padding: '16px 16px 0', boxSizing: 'border-box', transform: 'rotate(-1deg)', boxShadow: '0 40px 80px -30px rgba(0,0,0,.6)' }}>
          <img src={assetUrl(cur.asset)} alt={cur.label} style={{ display: 'block', width: '100%', maxHeight: '72vh', aspectRatio: '3 / 4', objectFit: 'cover', objectPosition: cur.pos ?? '50% 40%' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, padding: '12px 6px 16px' }}>
            <span style={{ fontFamily: "'Patrick Hand', cursive", fontSize: 21, color: '#525B50' }}>{cur.caption}</span>
            <span style={{ fontSize: 11, letterSpacing: '.2em', color: '#6B6158' }}>
              {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
            </span>
          </div>
        </div>
        {nextBtn}
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close photo viewer" className="d-lbbtn" style={{ ...round, position: 'absolute', top: 28, right: 28, width: 48, height: 48 }}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
    )
  }

  return (
    <div className="fade" role="dialog" aria-modal="true" aria-label="Photo viewer" data-nonav="1" style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(57,52,47,.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: 20, boxSizing: 'border-box' }}>
      <button ref={closeRef} type="button" onClick={onClose} aria-label="Close photo viewer" style={{ ...round, position: 'absolute', top: 14, right: 14, width: 44, height: 44 }}>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FAF7F0" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
      <div key={index} className="lbcard" style={{ width: 300, maxWidth: '100%', background: '#FAF7F0', padding: '12px 12px 0', boxSizing: 'border-box', transform: 'rotate(-1deg)' }}>
        <img src={assetUrl(cur.asset)} alt={cur.label} style={{ display: 'block', width: '100%', aspectRatio: '3 / 4', objectFit: 'cover', objectPosition: cur.pos ?? '50% 40%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 4px 14px' }}>
          <span style={{ fontFamily: "'Patrick Hand', cursive", fontSize: 20, color: '#525B50' }}>{cur.caption}</span>
          <span style={{ fontSize: 10, letterSpacing: '.2em', color: '#6B6158' }}>
            {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        <button type="button" onClick={() => onIndex((index - 1 + n) % n)} aria-label="Previous photo" style={round}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FAF7F0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <button type="button" onClick={() => onIndex((index + 1) % n)} aria-label="Next photo" style={round}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FAF7F0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  )
}
