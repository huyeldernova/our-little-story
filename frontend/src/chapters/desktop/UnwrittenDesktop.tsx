import type { CSSProperties, ReactNode } from 'react'
import { useStory } from '../../story/StoryContext'
import type { ChapterProps } from '../types'

const hand = "'Patrick Hand', cursive"
const serif = "'Cormorant Garamond', serif"
const frameLabel: CSSProperties = { fontSize: 10, letterSpacing: '.22em', color: '#E6D8C5' }
const emptyFrame: CSSProperties = { aspectRatio: '4 / 3', borderRadius: 3, border: '1.5px dashed rgba(230,216,197,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(250,247,240,.04)' }

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
      {children}
      <span style={frameLabel}>{label}</span>
    </li>
  )
}

/**
 * Chapter 06, desktop layout (Chapter.dc.html): the film roll with two developed and two
 * empty frames, the envelope with a short letter, and the last empty frame turning into
 * the invitation card (scroll-driven).
 */
export default function UnwrittenDesktop({ go, unwrittenOpen, openUnwritten }: ChapterProps) {
  const { t, asset } = useStory()
  const captions: [string, number, number, string][] = [
    ['c06.010', -3, 0, '#525B50'],
    ['c06.015', 2, -12, '#525B50'],
    ['c06.018', -2, -24, '#9B7663'],
    ['c06.021', 3, -36, '#9B7663'],
  ]

  return (
    <div style={{ position: 'relative', background: '#F3EBDD', overflow: 'clip' }}>
      <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '100px 40px 120px', boxSizing: 'border-box' }}>
        <header className="d-rise" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
          <span style={{ fontSize: 11, letterSpacing: '.3em', color: '#525B50' }}>{t('c06.001')}</span>
          <h2 style={{ margin: 0, fontFamily: serif, fontWeight: 500, fontSize: 62, lineHeight: 1.05 }}>
            {t('c06.002')} <em style={{ fontWeight: 400, color: '#9B7663' }}>{t('c06.003')}</em>
          </h2>
          <p style={{ margin: 0, fontFamily: serif, fontStyle: 'italic', fontSize: 24, color: '#525B50' }}>{t('c06.004')}</p>
        </header>

        <section aria-label={t('d06.002')} style={{ position: 'relative', marginTop: 90, padding: '40px 0 150px' }}>
          <div aria-hidden="true" style={{ position: 'absolute', left: '3%', right: '3%', top: 10, height: 420, background: '#E6D8C5', transform: 'rotate(1.2deg)' }} />
          <span className="d-rv" style={{ '--r': '-4deg', position: 'absolute', left: 20, top: -10, zIndex: 3, fontFamily: hand, fontSize: 22, color: '#9B7663', transform: 'rotate(-4deg)' } as CSSProperties}>{t('c06.005')}</span>

          <div style={{ position: 'relative', zIndex: 2, margin: '0 -10px', transform: 'rotate(-2.5deg)', background: '#2E2A26', padding: '12px 22px', boxShadow: '0 34px 60px -28px rgba(57,52,47,.75)' }}>
            <div className="d-holes" aria-hidden="true" />
            <div aria-hidden="true" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 4px 4px', fontSize: 10, letterSpacing: '.3em', color: '#C9A15A', opacity: 0.8 }}>
              <span>{t('d06.001')}</span>
              {[1, 2, 3, 4].map((n) => <span key={n}>◂ {n}</span>)}
            </div>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
              <Frame label={t('c06.009')}>
                <div className="m6dev" style={{ position: 'relative', aspectRatio: '4 / 3', background: '#1E1B18', display: 'flex', overflow: 'hidden', borderRadius: 3 }}>
                  <img src={asset('profile-1.jpg')} alt={t('c06.006')} style={{ flex: 1, minWidth: 0, height: '100%', objectFit: 'cover', objectPosition: '55% 25%' }} />
                  <img src={asset('profile-2.jpg')} alt={t('c06.007')} style={{ flex: 1, minWidth: 0, height: '100%', objectFit: 'cover', objectPosition: '50% 32%' }} />
                  <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%) rotate(-8deg)', padding: '3px 8px', border: '2px solid #E6D8C5', color: '#F3EBDD', background: 'rgba(46,42,38,.35)', fontWeight: 700, fontSize: 11, letterSpacing: '.08em', whiteSpace: 'nowrap' }}>{t('c06.008')}</span>
                </div>
              </Frame>
              <Frame label={t('c06.014')}>
                <div className="m6dev" style={{ aspectRatio: '4 / 3', background: '#FAF7F0', borderRadius: 3, padding: 12, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, lineHeight: 1.35, overflow: 'hidden' }}>
                  <span style={{ alignSelf: 'center', fontSize: 8, letterSpacing: '.24em', color: '#9B7663' }}>{t('d02.008')}</span>
                  <span style={{ alignSelf: 'flex-start', padding: '5px 8px', background: '#E6D8C5', borderRadius: '10px 10px 10px 3px' }}>{t('c06.011')}</span>
                  <span style={{ alignSelf: 'flex-end', padding: '5px 8px', background: '#525B50', color: '#FAF7F0', borderRadius: '10px 10px 3px 10px' }}>{t('c06.012')}</span>
                  <span style={{ alignSelf: 'flex-end', padding: '5px 8px', background: '#525B50', color: '#FAF7F0', borderRadius: '10px 3px 3px 10px' }}>{t('c06.013')}</span>
                </div>
              </Frame>
              <Frame label={t('c06.017')}>
                <div className="m6glow" style={emptyFrame}>
                  <span style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 22, color: 'rgba(243,235,221,.75)' }}>{t('c06.016')}</span>
                </div>
              </Frame>
              <Frame label={t('c06.020')}>
                <div className="m6glow" style={{ ...emptyFrame, animationDelay: '1.6s' }}>
                  <span style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 22, color: 'rgba(243,235,221,.75)' }}>{t('c06.019')}</span>
                </div>
              </Frame>
            </ol>
            <div className="d-holes" aria-hidden="true" style={{ marginTop: 10 }} />
          </div>

          <div style={{ position: 'relative', zIndex: 3, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginTop: 26, padding: '0 22px' }}>
            {captions.map(([k, r, mt, c]) => (
              <span key={k} className="d-rv" style={{ '--r': `${r}deg`, marginTop: mt, fontFamily: hand, fontSize: 20, lineHeight: 1.3, color: c, transform: `rotate(${r}deg)` } as CSSProperties}>{t(k)}</span>
            ))}
          </div>
        </section>

        <section aria-label={t('d06.003')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {!unwrittenOpen ? (
            <>
              <button className="d-env d-rv" type="button" onClick={openUnwritten} aria-label={t('c06.022')} style={{ position: 'relative', width: 460, maxWidth: '100%', aspectRatio: '460 / 290', padding: 0, border: 0, background: 'transparent', cursor: 'pointer' }}>
                <span aria-hidden="true" style={{ position: 'absolute', inset: 0, background: '#E6D8C5', boxShadow: '0 2px 4px rgba(57,52,47,.15), 0 40px 60px -28px rgba(57,52,47,.55)' }} />
                <span aria-hidden="true" style={{ position: 'absolute', inset: 0, background: '#DDCBB3', clipPath: 'polygon(0 100%, 50% 48%, 100% 100%)' }} />
                <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '58%', background: '#D5C1A6', clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
                <span aria-hidden="true" className="pulse" style={{ position: 'absolute', left: '50%', top: '56%', width: 76, height: 76, margin: '-38px 0 0 -38px', borderRadius: '50%', background: '#9B7663', boxShadow: 'inset 0 0 0 6px rgba(57,52,47,.16), 0 6px 12px rgba(57,52,47,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Dancing Script', cursive", fontSize: 32, color: '#F3EBDD' }}>{t('c06.023')}</span>
                <span aria-hidden="true" style={{ position: 'absolute', left: '7%', bottom: '10%', fontFamily: "'Dancing Script', cursive", fontSize: 30, color: '#39342F' }}>{t('c06.024')}</span>
                <span aria-hidden="true" style={{ position: 'absolute', right: '7%', top: '9%', width: 54, height: 64, background: '#FAF7F0', border: '2px dotted #9B7663', boxSizing: 'border-box', transform: 'rotate(4deg)' }} />
              </button>
              <span style={{ marginTop: 20, fontFamily: hand, fontSize: 21, color: '#9B7663' }}>{t('c06.025')}</span>
            </>
          ) : (
            <article className="d-unfold" aria-label={t('c06.026')} style={{ position: 'relative', width: 640, maxWidth: '100%', background: '#FAF7F0', backgroundImage: 'radial-gradient(circle at 15% 12%, rgba(155,118,99,.07), transparent 40%), repeating-linear-gradient(180deg, transparent 0 37px, rgba(155,118,99,.16) 37px 38px)', padding: '52px 60px 46px 70px', boxSizing: 'border-box', transform: 'rotate(-.6deg)', boxShadow: '0 2px 3px rgba(57,52,47,.12), 0 44px 70px -32px rgba(57,52,47,.55)' }}>
              <div aria-hidden="true" style={{ position: 'absolute', left: 46, top: 0, bottom: 0, width: 1, background: 'rgba(199,143,145,.55)' }} />
              <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: -12, width: 110, height: 24, marginLeft: -55, background: 'rgba(82,91,80,.32)', transform: 'rotate(-3deg)' }} />
              <div style={{ fontFamily: hand, fontSize: 23, lineHeight: '38px', color: '#39342F' }}>
                <p style={{ margin: 0, fontFamily: "'Dancing Script', cursive", fontSize: 36, lineHeight: '38px' }}>{t('c06.027')}</p>
                {['c06.028', 'c06.029', 'c06.030', 'c06.031'].map((k) => (
                  <p key={k} style={{ margin: '38px 0 0' }}>{t(k)}</p>
                ))}
                <p style={{ margin: '38px 0 0', textAlign: 'right', fontFamily: "'Dancing Script', cursive", fontSize: 32, color: '#9B7663' }}>{t('c06.032')}</p>
              </div>
            </article>
          )}
        </section>

        <section aria-label={t('d06.004')} style={{ marginTop: 130, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, textAlign: 'center' }}>
          <p className="d-rv" style={{ margin: 0, maxWidth: 680, fontFamily: hand, fontSize: 34, lineHeight: 1.35, color: '#39342F' }}>{t('c06.033')}</p>
          <div style={{ position: 'relative', width: 440, maxWidth: '100%', height: 310, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="m6morph" style={{ position: 'relative', width: '100%', height: '100%', boxSizing: 'border-box', background: '#FAF7F0', border: '1.5px solid #CDBBA3', padding: 12, transform: 'rotate(-.6deg)', boxShadow: '0 34px 60px -30px rgba(57,52,47,.55)' }}>
              <div className="m6morphIn" style={{ width: '100%', height: '100%', boxSizing: 'border-box', border: '1px solid #E6D8C5', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 14 }}>
                <span aria-hidden="true" style={{ fontSize: 9, letterSpacing: '.3em', color: '#CDBBA3' }}>04 → 07</span>
              </div>
              <span className="m6morphLabel" aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', fontFamily: serif, fontStyle: 'italic', fontSize: 28, color: 'rgba(243,235,221,.85)', opacity: 0 }}>{t('c06.019')}</span>
            </div>
          </div>
          <span className="d-rv" style={{ fontFamily: hand, fontSize: 20, color: '#9B7663' }}>{t('c06.034')}</span>
          <a className="d-rv" href="/story/7" onClick={(e) => { e.preventDefault(); go(6) }} style={{ minHeight: 48, display: 'inline-flex', alignItems: 'center', fontFamily: hand, fontSize: 23, color: '#39342F', textDecoration: 'none', borderBottom: '1px solid #9B7663' }}>{t('c06.035')}</a>
        </section>
      </div>
    </div>
  )
}
