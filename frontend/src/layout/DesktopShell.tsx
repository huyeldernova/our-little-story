import type { MouseEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Props = {
  page: number
  /** Dark desk background (the letter chapter). */
  dark?: boolean
  titles: string[]
  go: (index: number) => void
  t: (key: string) => string
  userName?: string
  /** The story author sees a small link to /admin/story next to the logout button. */
  isAdmin?: boolean
  onLogout: () => void
  /** The chapter view (desktop layout, or the framed mobile page while a desktop layout is missing). */
  children: ReactNode
  /** Fixed overlays (music postcard, lightbox). */
  overlays?: ReactNode
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Desktop frame (≥1024px): a full-width page that scrolls with the window, the chapter
 * indicator on the right (.ch-ind, as in the 1440px canvases) and ← / → at the end of
 * every chapter. No swipe or tap zones here; the arrow keys are handled by StoryLayout.
 */
export default function DesktopShell({ page, dark = false, titles, go, t, userName, isAdmin = false, onLogout, children, overlays }: Props) {
  const link = (i: number) => (e: MouseEvent) => {
    e.preventDefault()
    go(i)
  }
  const last = titles.length - 1
  const c = dark
    ? { bg: '#39342F', fg: '#FAF7F0', muted: '#CDBBA3', cur: '#FAF7F0', other: '#CDBBA3', lineCur: '#C78F91', line: '#6B6158', rule: 'rgba(250,247,240,.14)' }
    : { bg: '#F3EBDD', fg: '#39342F', muted: '#6B6158', cur: '#39342F', other: '#6B6158', lineCur: '#9B7663', line: '#B8A894', rule: '#E6D8C5' }

  return (
    <div className={dark ? 'd-page d-dark' : 'd-page'} style={{ position: 'relative', minHeight: '100dvh', background: c.bg, color: c.fg, transition: 'background .4s ease', fontFamily: 'Inter, sans-serif', overflowX: 'clip' }}>
      <nav className="ch-ind" aria-label="Chapters" style={{ position: 'absolute', right: 32, top: 140, display: 'flex', flexDirection: 'column', gap: 14, zIndex: 5 }}>
        {titles.map((title, i) => {
          const cur = i === page
          return (
            <a key={i} href={`/story/${i + 1}`} onClick={link(i)} aria-current={cur ? 'page' : undefined} aria-label={`${pad(i + 1)} ${title}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, textDecoration: 'none', color: cur ? c.cur : c.other, fontSize: 11, letterSpacing: '.12em', minHeight: 20 }}>
              {cur && <span className="ch-title" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 15, letterSpacing: 0 }}>{title}</span>}
              <span>{pad(i + 1)}</span>
              <span className="ch-line" style={{ display: 'block', width: cur ? 36 : 16, height: 1, background: cur ? c.lineCur : c.line }} />
            </a>
          )
        })}
      </nav>

      <div key={page} className="fade">{children}</div>

      <nav aria-label="Chapter navigation" style={{ position: 'relative', maxWidth: 1120, margin: '0 auto', padding: '36px 56px 120px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, borderTop: `1px solid ${c.rule}` }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {page > 0 && (
            <a className="d-navlink" href={`/story/${page}`} onClick={link(page - 1)} rel="prev" style={{ display: 'inline-flex', flexDirection: 'column', gap: 4, textDecoration: 'none', color: c.fg }}>
              <span style={{ fontSize: 11, letterSpacing: '.2em', color: c.muted }}>← {t('d00.002')}</span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 22 }}>{pad(page)} · {titles[page - 1]}</span>
            </a>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: c.muted }}>
          {userName && <span>{userName}</span>}
          {isAdmin && <Link to="/admin/story" style={{ color: c.muted, fontSize: 11, letterSpacing: '.12em' }}>NỘI DUNG</Link>}
          <button type="button" onClick={onLogout} style={{ minHeight: 40, padding: '0 8px', border: 0, background: 'transparent', color: c.fg, fontSize: 11, letterSpacing: '.16em', textDecoration: 'underline', cursor: 'pointer' }}>
            {t('d00.001')}
          </button>
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>
          {page < last && (
            <a className="d-navlink" href={`/story/${page + 2}`} onClick={link(page + 1)} rel="next" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, textDecoration: 'none', color: c.fg }}>
              <span style={{ fontSize: 11, letterSpacing: '.2em', color: c.muted }}>{t('d00.003')} →</span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 22 }}>{pad(page + 2)} · {titles[page + 1]}</span>
            </a>
          )}
        </div>
      </nav>

      {overlays}
    </div>
  )
}
