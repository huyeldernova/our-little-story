import type { CSSProperties } from 'react'
import { useStory } from '../../story/StoryContext'
import type { ChapterProps } from '../types'

const hand = "'Patrick Hand', cursive"
const bubbleL: CSSProperties = { alignSelf: 'flex-start', maxWidth: '74%', marginLeft: 44, padding: '11px 15px', background: '#E6D8C5', borderRadius: '16px 16px 16px 4px' }
const bubbleR: CSSProperties = { alignSelf: 'flex-end', maxWidth: '74%', padding: '11px 15px', background: '#525B50', color: '#FAF7F0', borderRadius: '16px 16px 4px 16px' }
const bubbleR2: CSSProperties = { ...bubbleR, borderRadius: '16px 4px 4px 16px' }
const pill: CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px 12px 14px', background: '#FAF7F0', borderRadius: 999, boxShadow: '0 0 0 5px #FFFFFF, 0 12px 22px -10px rgba(57,52,47,.45)' }
const pillIcon: CSSProperties = { width: 46, height: 46, borderRadius: '50%', background: '#F3EBDD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#525B50' }
const polaroid: CSSProperties = { position: 'absolute', top: 0, width: 320, margin: 0, background: '#FAF7F0', padding: '14px 14px 0', boxSizing: 'border-box', boxShadow: '0 2px 3px rgba(57,52,47,.14), 0 30px 50px -22px rgba(57,52,47,.55)' }
const caption: CSSProperties = { padding: '12px 4px 18px', fontFamily: "'Dancing Script', cursive", fontSize: 30, color: '#39342F' }
const mini: CSSProperties = { position: 'absolute', width: 170, background: '#FAF7F0', padding: '9px 9px 30px', boxSizing: 'border-box', boxShadow: '0 18px 30px -14px rgba(57,52,47,.5)', zIndex: 2 }

/** Chapter 02, desktop layout (Met.dc.html): profiles, the match stamp, common ground, the first chat. */
export default function MatchDesktop({ next }: ChapterProps) {
  const { t, asset } = useStory()
  return (
    <div style={{ position: 'relative', background: '#F3EBDD', overflow: 'clip' }}>
      <div style={{ position: 'relative', maxWidth: 1120, margin: '0 auto', padding: '100px 56px 130px', boxSizing: 'border-box' }}>
        <header className="d-rise" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
          <span style={{ fontSize: 11, letterSpacing: '.3em', color: '#525B50' }}>{t('c02.001')}</span>
          <h2 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontSize: 64, lineHeight: 1.05, letterSpacing: '.03em', color: '#39342F' }}>{t('c02.002')}</h2>
          <p style={{ margin: 0, fontFamily: hand, fontSize: 24, color: '#9B7663' }}>{t('c02.003')}</p>
        </header>

        <section aria-label={t('d02.003')} style={{ position: 'relative', marginTop: 90, minHeight: 620 }}>
          <div aria-hidden="true" style={{ position: 'absolute', left: '12%', top: 40, width: '70%', height: 520, background: '#E6D8C5', transform: 'rotate(-2deg)' }} />
          <div aria-hidden="true" style={{ position: 'absolute', left: '30%', top: 10, width: '40%', height: 300, background: '#FAF7F0', opacity: 0.5, transform: 'rotate(3deg)' }} />

          <figure className="d-drop" style={{ ...polaroid, '--r': '-5deg', '--dy': '-36px', left: '16%', transform: 'rotate(-5deg)', zIndex: 2 } as CSSProperties}>
            <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: -14, width: 120, height: 28, marginLeft: -60, background: 'rgba(82,91,80,.38)', transform: 'rotate(-4deg)' }} />
            <img src={asset('profile-1.jpg')} alt={t('c02.004')} style={{ display: 'block', width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', objectPosition: '50% 18%' }} />
            <figcaption style={caption}>{t('c02.005')}</figcaption>
          </figure>

          <figure className="d-drop" style={{ ...polaroid, '--r': '4deg', '--dy': '-36px', left: '48%', top: 70, transform: 'rotate(4deg)', zIndex: 3, animationDelay: '.25s' } as CSSProperties}>
            <svg aria-hidden="true" width="26" height="62" viewBox="0 0 26 62" fill="none" stroke="#8A8378" strokeWidth="2.2" strokeLinecap="round" style={{ position: 'absolute', right: 40, top: -24 }}><path d="M8 50V12a6 6 0 0 1 12 0v40a9 9 0 0 1-18 0V18" /></svg>
            <img src={asset('profile-2.jpg')} alt={t('c02.006')} style={{ display: 'block', width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', objectPosition: '50% 30%' }} />
            <figcaption style={caption}>{t('c02.007')}</figcaption>
          </figure>

          <div className="d-rv" style={{ '--r': '3deg', position: 'absolute', right: '2%', top: 360, width: 220, background: '#FAF7F0', backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 29px, rgba(155,118,99,.2) 29px 30px)', padding: '18px 20px 20px', boxSizing: 'border-box', transform: 'rotate(3deg)', boxShadow: '0 1px 2px rgba(57,52,47,.1), 0 14px 26px -14px rgba(57,52,47,.4)', zIndex: 4 } as CSSProperties}>
            <span style={{ fontFamily: hand, fontSize: 23, lineHeight: '30px', color: '#525B50' }}>{t('c02.008')}</span>
          </div>
        </section>

        <section aria-label={t('d02.004')} style={{ position: 'relative', marginTop: 110, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 560, maxWidth: '100%', height: 300 }}>
            <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: 20, width: 460, height: 260, marginLeft: -230, background: '#E6D8C5', transform: 'rotate(1.5deg)' }} />
            <div className="d-mvL" style={{ ...mini, left: 90, top: 30, transform: 'rotate(-5deg)' }}>
              <img src={asset('profile-1.jpg')} alt="" style={{ display: 'block', width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', objectPosition: '55% 30%' }} />
            </div>
            <div className="d-mvR" style={{ ...mini, right: 90, top: 40, transform: 'rotate(5deg)' }}>
              <img src={asset('profile-2.jpg')} alt="" style={{ display: 'block', width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', objectPosition: '50% 38%' }} />
            </div>
            <div className="d-stp" role="img" aria-label={t('c02.009')} style={{ position: 'absolute', left: '50%', top: 104, width: 250, marginLeft: -125, zIndex: 4, transform: 'rotate(-8deg)', opacity: 0.92 }}>
              <div className="ink-stamp" style={{ border: '4px solid #A8655A', outline: '1.5px solid #A8655A', outlineOffset: 4, padding: '12px 10px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#A8655A', background: 'rgba(243,235,221,.55)' }}>
                <span aria-hidden="true" style={{ fontSize: 10, letterSpacing: '.5em' }}>★ ★ ★</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 32, letterSpacing: '.06em', lineHeight: 1 }}>{t('c02.010')}</span>
              </div>
            </div>
          </div>
          <p className="d-rv" style={{ margin: '26px 0 0', fontFamily: hand, fontSize: 30, color: '#39342F' }}>{t('c02.011')}</p>
        </section>

        <section aria-label={t('d02.005')} style={{ position: 'relative', marginTop: 120, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', gap: 34, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', padding: '34px 54px', background: '#E6D8C5', transform: 'rotate(-1deg)' }}>
            <div aria-hidden="true" style={{ position: 'absolute', left: -12, top: 18, width: 70, height: 22, background: 'rgba(250,247,240,.65)', transform: 'rotate(-30deg)' }} />
            <div className="d-rv" style={{ ...pill, '--r': '-4deg', transform: 'rotate(-4deg)' } as CSSProperties}>
              <span style={pillIcon}>
                <svg aria-hidden="true" width="30" height="30" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13 L6 4 L12 9 Q16 8 20 9 L26 4 L26 13 Q28 17 26 22 Q22 28 16 28 Q10 28 6 22 Q4 17 6 13 Z" /><path d="M12 16h.01M20 16h.01" /><path d="M14.5 20 L16 21.2 L17.5 20" /><path d="M3 18l5 .5M3 22l5-1M29 18l-5 .5M29 22l-5-1" /></svg>
              </span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 500 }}>{t('c02.012')}</span>
            </div>
            <div className="d-rv" style={{ ...pill, '--r': '3deg', transform: 'rotate(3deg)' } as CSSProperties}>
              <span style={pillIcon}>
                <svg aria-hidden="true" width="30" height="30" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12 L16 6 L30 12 L16 18 Z" /><path d="M8 15v6c0 2.5 3.6 4 8 4s8-1.5 8-4v-6" /><path d="M28 13v8" /><circle cx="28" cy="22.5" r="1.3" /></svg>
              </span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 500 }}>{t('c02.013')}</span>
            </div>
          </div>
          <p className="d-rv" style={{ margin: '30px 0 0', fontFamily: hand, fontSize: 26, color: '#525B50', textAlign: 'center' }}>{t('c02.014')}</p>
        </section>

        <section aria-label={t('d02.006')} style={{ position: 'relative', margin: '130px auto 0', width: 580, maxWidth: '100%' }}>
          <div className="d-rvL d-mnote" style={{ '--r': '-3deg', position: 'absolute', left: -280, top: 150, width: 230, transform: 'rotate(-3deg)', zIndex: 3 } as CSSProperties}>
            <span style={{ display: 'block', fontFamily: hand, fontSize: 24, lineHeight: 1.25, color: '#9B7663' }}>{t('d02.001')}</span>
            <svg aria-hidden="true" width="120" height="40" viewBox="0 0 120 40" fill="none" stroke="#9B7663" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '4px 0 0 60px' }}><path d="M2 8 C 40 4, 80 14, 112 30" /><path d="M100 32l12-2-4-11" /></svg>
          </div>
          <div className="d-rvR d-mnote" style={{ '--r': '2.5deg', position: 'absolute', right: -300, top: 250, width: 250, transform: 'rotate(2.5deg)', zIndex: 3 } as CSSProperties}>
            <svg aria-hidden="true" width="110" height="40" viewBox="0 0 110 40" fill="none" stroke="#525B50" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 0 4px 0' }}><path d="M106 34 C 70 32, 30 24, 6 8" /><path d="M4 20l2-12 11 3" /></svg>
            <span style={{ display: 'block', fontFamily: hand, fontSize: 22, lineHeight: 1.3, color: '#525B50' }}>{t('d02.002')}</span>
          </div>

          <div style={{ position: 'relative', background: '#FAF7F0', backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 35px, rgba(155,118,99,.1) 35px 36px)', padding: '70px 40px 48px', boxSizing: 'border-box', transform: 'rotate(-.6deg)', boxShadow: '0 2px 3px rgba(57,52,47,.12), 0 40px 70px -34px rgba(57,52,47,.5)' }}>
            <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: -14, width: 140, height: 28, marginLeft: -70, background: 'rgba(199,143,145,.55)', transform: 'rotate(-3deg)' }} />
            <div style={{ position: 'absolute', left: '50%', top: 18, transform: 'translateX(-50%) rotate(-2deg)', padding: '6px 16px', border: '1.5px solid #9B7663', color: '#9B7663', fontSize: 12, letterSpacing: '.3em', fontWeight: 500 }}>{t('d02.008')}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 16, lineHeight: 1.45 }}>
              <div className="d-rvL" style={{ display: 'flex', alignItems: 'flex-end', gap: 10, alignSelf: 'flex-start', maxWidth: '78%' }}>
                <img src={asset('profile-2.jpg')} alt="" style={{ width: 34, height: 34, flex: '0 0 auto', borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 30%', border: '2px solid #FFFFFF' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontFamily: hand, fontSize: 15, color: '#6B6158' }}>{t('c02.015')}</span>
                  <span style={{ padding: '11px 15px', background: '#E6D8C5', borderRadius: '16px 16px 16px 4px' }}>{t('c02.016')}</span>
                </div>
              </div>
              <div className="d-rvR" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, alignSelf: 'flex-end', maxWidth: '74%', marginTop: 6 }}>
                <span style={{ fontFamily: hand, fontSize: 15, color: '#6B6158' }}>{t('c02.018')}</span>
                <span style={{ padding: '11px 15px', background: '#525B50', color: '#FAF7F0', borderRadius: '16px 16px 4px 16px' }}>{t('c02.019')}</span>
              </div>
              <span className="d-rvR" style={bubbleR2}>{t('c02.020')}</span>
              <span className="d-rvL" style={bubbleL}>{t('c02.022')}</span>
              <span className="d-rvR" style={bubbleR}>{t('c02.023')}</span>
              <span className="d-rvL" style={bubbleL}>{t('c02.024')}</span>
              <span className="d-rvR" style={bubbleR}>{t('c02.025')}</span>
              <span className="d-rvR" style={bubbleR2}>{t('c02.026')}</span>
              <span className="d-rvL" style={bubbleL}>{t('c02.027')}</span>
              <span className="d-rvR" style={bubbleR}>{t('c02.028')}</span>
            </div>
          </div>
        </section>

        <section aria-label={t('d02.007')} style={{ marginTop: 140, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="d-rv" style={{ '--r': '1deg', position: 'relative', width: 560, maxWidth: '100%', background: '#FAF7F0', padding: '48px 52px 44px', boxSizing: 'border-box', transform: 'rotate(1deg)', boxShadow: '0 2px 3px rgba(57,52,47,.1), 0 30px 54px -26px rgba(57,52,47,.45)' } as CSSProperties}>
            <div aria-hidden="true" style={{ position: 'absolute', left: 34, top: -12, width: 90, height: 24, background: 'rgba(82,91,80,.32)', transform: 'rotate(-5deg)' }} />
            <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: 24, lineHeight: 1.5, color: '#39342F' }}>{t('c02.029')}</p>
            <p style={{ margin: '16px 0 0', fontFamily: "'Cormorant Garamond', serif", fontSize: 24, lineHeight: 1.5, color: '#39342F' }}>{t('c02.030')}</p>
            <p style={{ margin: '28px 0 0', fontFamily: "'Dancing Script', cursive", fontSize: 34, lineHeight: 1.25, color: '#9B7663' }}>{t('c02.031')}</p>
          </div>
          <a className="d-rv" href="/story/3" onClick={(e) => { e.preventDefault(); next() }} style={{ marginTop: 56, minHeight: 48, display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: hand, fontSize: 24, color: '#39342F', textDecoration: 'none', borderBottom: '1px solid #9B7663' }}>{t('c02.032')}</a>
        </section>
      </div>
    </div>
  )
}
