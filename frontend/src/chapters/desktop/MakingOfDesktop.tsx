import type { CSSProperties, ReactNode } from 'react'
import { useStory } from '../../story/StoryContext'
import type { ChapterProps } from '../types'
import { place } from './place'

const hand = "'Patrick Hand', cursive"
const serif = "'Cormorant Garamond', serif"
// Inner width of Moments.dc.html at 1440px: 1140 max-width − 2×56 padding.
const W = 1028
const desk = place(W, 560)
const pages = place(W, 560)
const fixes = place(W, 520)
const result = place(W, 620)
const ruled = (step: number) => `repeating-linear-gradient(180deg, transparent 0 ${step - 1}px, rgba(155,118,99,.2) ${step - 1}px ${step}px)`
const cardShadow = '0 18px 30px -16px rgba(57,52,47,.45)'

function Heading({ n, label }: { n: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
      <span style={{ fontFamily: serif, fontSize: 44, color: '#9B7663' }}>{n}</span>
      <span style={{ fontSize: 11, letterSpacing: '.3em', color: '#525B50' }}>{label}</span>
    </div>
  )
}
function Lead({ children, max }: { children: ReactNode; max?: number }) {
  return <p className="d-rv" style={{ margin: '12px 0 0', maxWidth: max, fontFamily: serif, fontSize: 34, lineHeight: 1.3 }}>{children}</p>
}
const Line = ({ children, size = 19, color = '#525B50' }: { children: ReactNode; size?: number; color?: string }) => (
  <span style={{ display: 'block', fontFamily: hand, fontSize: size, lineHeight: '30px', color }}>{children}</span>
)

/** Chapter 04, desktop layout (Moments.dc.html): the idea, page by page, small fixes, the result. Uses the real screenshots. */
export default function MakingOfDesktop({ next }: ChapterProps) {
  const { t, asset } = useStory()
  return (
    <div style={{ position: 'relative', background: '#F3EBDD', overflow: 'clip' }}>
      <div style={{ position: 'relative', maxWidth: 1140, margin: '0 auto', padding: '100px 56px 130px', boxSizing: 'border-box' }}>
        <header className="d-rise" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
          <span style={{ fontSize: 11, letterSpacing: '.3em', color: '#525B50' }}>{t('c04.001')}</span>
          <h2 style={{ margin: 0, fontFamily: serif, fontWeight: 500, fontSize: 56, lineHeight: 1.05, letterSpacing: '.04em' }}>
            {t('c04.002')}
            <br />
            <em style={{ fontWeight: 400, letterSpacing: '.01em', color: '#9B7663' }}>{t('c04.003')}</em>
          </h2>
          <p style={{ margin: '4px 0 0', fontFamily: hand, fontSize: 22, color: '#525B50' }}>{t('c04.004')}</p>
        </header>

        {/* 01 — the idea */}
        <section aria-label={t('d04.017')} style={{ marginTop: 100 }}>
          <Heading n="01" label={t('c04.005')} />
          <Lead max={640}>{t('c04.006')}</Lead>
          <div role="img" aria-label={t('d04.001')} style={{ ...desk.frame, marginTop: 50, background: '#E6D8C5', backgroundImage: 'repeating-linear-gradient(90deg, rgba(155,118,99,.07) 0 2px, transparent 2px 22px)', boxShadow: 'inset 0 0 120px rgba(57,52,47,.12)' }}>
            <div className="d-pr" style={{ ...desk.at({ left: 60, top: 60, width: 470, height: 420 }), '--r': '-4deg', display: 'flex', transform: 'rotate(-4deg)', boxShadow: '0 30px 50px -24px rgba(57,52,47,.55)' } as CSSProperties}>
              <div style={{ flex: 1, minWidth: 0, background: '#FAF7F0', backgroundImage: ruled(30), padding: '32px 22px', boxSizing: 'border-box', borderRight: '1px solid #E6D8C5' }}>
                <Line size={24} color="#39342F">{t('c04.008')}</Line>
                <Line>{t('c04.009')}</Line>
                <Line>{t('c04.010')}</Line>
                <Line>{t('c04.011')}</Line>
                <Line>{t('c04.012')}</Line>
                <Line>{t('c04.013')}</Line>
              </div>
              <div style={{ flex: 1, minWidth: 0, background: '#FAF7F0', backgroundImage: ruled(30), padding: '32px 22px', boxSizing: 'border-box', position: 'relative' }}>
                <Line color="#9B7663">{t('d04.002')}</Line>
                <Line>{t('d04.003')}</Line>
                <Line>{t('d04.004')}</Line>
                <Line>{t('d04.005')}</Line>
                <svg aria-hidden="true" width="120" height="70" viewBox="0 0 120 70" fill="none" stroke="#9B7663" strokeWidth="1.6" strokeLinecap="round" style={{ position: 'absolute', left: 20, bottom: 30 }}><rect x="8" y="10" width="44" height="48" rx="2" transform="rotate(-6 30 34)" /><rect x="62" y="8" width="44" height="48" rx="2" transform="rotate(5 84 32)" /></svg>
              </div>
              <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 18, marginLeft: -9, background: 'linear-gradient(90deg, rgba(57,52,47,0), rgba(57,52,47,.12), rgba(57,52,47,0))' }} />
            </div>

            <div className="d-pr" style={{ ...desk.at({ right: 70, top: 90, width: 440 }), '--r': '3deg', transform: 'rotate(3deg)' } as CSSProperties}>
              <div style={{ background: '#39342F', borderRadius: '12px 12px 4px 4px', padding: '14px 14px 18px', boxShadow: '0 30px 50px -22px rgba(57,52,47,.6)' }}>
                <img src={asset('shot-cover-closed.jpg')} alt="" style={{ display: 'block', width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', borderRadius: 2 }} />
              </div>
              <div style={{ height: 16, margin: '0 -28px', background: '#6B6158', borderRadius: '0 0 12px 12px', boxShadow: '0 16px 24px -12px rgba(57,52,47,.5)' }} />
            </div>

            <div aria-hidden="true" style={{ ...desk.at({ left: 560, bottom: 50 }), width: 96, height: 96, borderRadius: '50%', background: '#FAF7F0', boxShadow: '0 14px 26px -12px rgba(57,52,47,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ width: 66, height: 66, borderRadius: '50%', background: '#7A5A48', boxShadow: 'inset 0 0 0 6px #9B7663' }} />
            </div>
            <div aria-hidden="true" style={{ ...desk.at({ left: 640, top: 70 }), width: 170, height: 10, background: '#C9A15A', borderRadius: 2, transform: 'rotate(28deg)', boxShadow: '0 6px 10px -6px rgba(57,52,47,.5)' }}>
              <span style={{ position: 'absolute', right: -14, top: 0, borderLeft: '14px solid #E6D8C5', borderTop: '5px solid transparent', borderBottom: '5px solid transparent' }} />
            </div>
            <span aria-hidden="true" style={{ position: 'absolute', right: 18, bottom: 12, fontSize: 10, letterSpacing: '.2em', color: '#6B6158' }}>{t('c04.015')}</span>
          </div>
        </section>

        {/* 02 — page by page, real screenshots */}
        <section aria-label={t('d04.018')} style={{ marginTop: 130 }}>
          <Heading n="02" label={t('c04.016')} />
          <Lead>{t('c04.017')}</Lead>
          <div style={{ ...pages.frame, marginTop: 56 }}>
            <div aria-hidden="true" style={{ ...pages.at({ top: 60, height: 420 }), left: '4%', width: '92%', background: '#E6D8C5', transform: 'rotate(-1deg)' }} />
            <Shot box={pages.at({ left: 0, top: 40, width: 360 })} r={-5} z={2} src={asset('shot-cover-open.jpg')} alt={t('d04.006')} ratio="16 / 11" pos="0% 30%" caption={t('c04.019')}
              tape={<div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: -12, width: 100, height: 24, marginLeft: -50, background: 'rgba(82,91,80,.35)', transform: 'rotate(-3deg)' }} />} />
            <Shot box={pages.at({ left: 370, top: 0, width: 360 })} r={2} z={3} src={asset('shot-ch02.jpg')} alt={t('d04.007')} ratio="16 / 13" pos="50% 10%" caption={t('c04.021')} />
            <Shot box={pages.at({ right: 0, top: 70, width: 340 })} r={-2} z={4} src={asset('shot-ch03.jpg')} alt={t('d04.008')} ratio="16 / 14" pos="50% 0%" caption={t('c04.023')}
              tape={<div aria-hidden="true" style={{ position: 'absolute', right: -14, top: 12, width: 76, height: 22, background: 'rgba(199,143,145,.55)', transform: 'rotate(40deg)' }} />} />
            <span className="d-rv" style={{ ...pages.at({ bottom: 0 }), left: '44%', '--r': '-6deg', padding: '6px 12px', border: '1.5px solid #A8655A', color: '#A8655A', fontSize: 11, letterSpacing: '.24em', transform: 'rotate(-6deg)', zIndex: 5, whiteSpace: 'nowrap' } as CSSProperties}>{t('c04.024')}</span>
          </div>
        </section>

        {/* 03 — a little perfectionism */}
        <section aria-label={t('d04.019')} style={{ marginTop: 130 }}>
          <Heading n="03" label={t('c04.025')} />
          <Lead max={760}>{t('c04.026')}</Lead>
          <div style={{ ...fixes.frame, marginTop: 56 }}>
            <div className="d-pr" style={{ ...fixes.at({ left: 0, top: 10, width: 330 }), '--r': '-3deg', background: '#FAF7F0', backgroundImage: ruled(34), padding: '26px 26px 22px', boxSizing: 'border-box', transform: 'rotate(-3deg)', boxShadow: cardShadow } as CSSProperties}>
              <span style={{ display: 'block', fontSize: 9, letterSpacing: '.3em', color: '#9B7663', lineHeight: '34px' }}>{t('c04.027')}</span>
              <span className="d-inkv" style={{ display: 'block', fontFamily: "'Dancing Script', cursive", fontSize: 32, lineHeight: '40px', color: '#39342F' }}>{t('c04.029')}</span>
            </div>
            <div className="d-pr" style={{ ...fixes.at({ left: 370, top: 0, width: 330 }), '--r': '2.5deg', background: '#FAF7F0', padding: '26px 26px 22px', boxSizing: 'border-box', transform: 'rotate(2.5deg)', boxShadow: cardShadow } as CSSProperties}>
              <span style={{ display: 'block', fontSize: 9, letterSpacing: '.3em', color: '#9B7663', marginBottom: 10 }}>{t('c04.030')}</span>
              <span style={{ display: 'block', fontFamily: serif, fontSize: 28 }}><span className="d-strike">{t('c04.031')}</span></span>
              <span className="d-inkv" style={{ display: 'block', marginTop: 8, fontFamily: serif, fontSize: 26, letterSpacing: '.03em' }}>{t('c04.032')}</span>
              <span style={{ display: 'block', marginTop: 6, fontFamily: hand, fontSize: 18, color: '#A8655A' }}>{t('c04.033')}</span>
            </div>
            <div className="d-pr" style={{ ...fixes.at({ right: 0, top: 30, width: 320 }), '--r': '-1.5deg', background: '#E6D8C5', padding: 24, boxSizing: 'border-box', transform: 'rotate(-1.5deg)', boxShadow: cardShadow, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 } as CSSProperties}>
              <span style={{ fontSize: 9, letterSpacing: '.3em', color: '#525B50' }}>{t('d04.009')}</span>
              <span style={{ padding: '6px 14px', border: '2px solid #6B6158', color: '#6B6158', fontSize: 13, letterSpacing: '.26em', opacity: 0.7 }}><span className="d-strike">{t('c04.034')}</span></span>
              <span style={{ fontFamily: hand, fontSize: 18, color: '#525B50' }}>{t('d04.010')}</span>
              <span style={{ padding: '8px 14px', border: '3px solid #A8655A', outline: '1px solid #A8655A', outlineOffset: 3, color: '#A8655A', fontWeight: 800, fontSize: 18, letterSpacing: '.05em', transform: 'rotate(-5deg)' }}>{t('c04.035')}</span>
            </div>
            <div className="d-pr" style={{ ...fixes.at({ left: 60, top: 300, width: 380 }), '--r': '3deg', background: '#FAF7F0', padding: '22px 24px', boxSizing: 'border-box', transform: 'rotate(3deg)', boxShadow: cardShadow } as CSSProperties}>
              <span style={{ display: 'block', fontSize: 9, letterSpacing: '.3em', color: '#9B7663', marginBottom: 8 }}>{t('c04.036')}</span>
              <span style={{ display: 'block', fontFamily: 'Caveat, cursive', fontSize: 26, color: '#6B6158' }}>
                <span className="d-strike">{t('c04.037')}</span> <span style={{ fontFamily: hand, fontSize: 17, color: '#A8655A' }}>{t('c04.038')}</span>
              </span>
              <span className="d-inkv" style={{ display: 'block', marginTop: 6, fontFamily: hand, fontSize: 24, color: '#39342F' }}>{t('c04.039')}</span>
            </div>
            <div className="d-pr" style={{ ...fixes.at({ left: 500, top: 300, width: 260 }), '--r': '-4deg', background: '#FAF7F0', padding: '18px 20px', boxSizing: 'border-box', transform: 'rotate(-4deg)', boxShadow: cardShadow } as CSSProperties}>
              <span style={{ display: 'block', fontFamily: hand, fontSize: 20, lineHeight: 1.35, color: '#39342F' }}><span className="d-strike">{t('d04.011')}</span></span>
              <span className="d-inkv" style={{ display: 'block', fontFamily: hand, fontSize: 20, lineHeight: 1.35, color: '#525B50' }}>{t('d04.012')}</span>
            </div>
            <div className="d-rv" style={{ ...fixes.at({ right: 30, top: 330, width: 230 }), '--r': '2deg', transform: 'rotate(2deg)', display: 'flex', flexDirection: 'column', gap: 6 } as CSSProperties}>
              <span style={{ fontFamily: hand, fontSize: 19, color: '#9B7663' }}>{t('d04.013')}</span>
              <span style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                {['#F3EBDD', '#525B50', '#9B7663', '#39342F'].map((c) => (
                  <span key={c} aria-hidden="true" style={{ width: 26, height: 26, background: c, border: c === '#F3EBDD' ? '1px solid #CDBBA3' : 0, boxSizing: 'border-box' }} />
                ))}
                <span style={{ fontFamily: hand, fontSize: 16, color: '#6B6158', marginLeft: 4 }}>{t('d04.014')}</span>
              </span>
            </div>
          </div>
        </section>

        {/* 04 — the result */}
        <section aria-label={t('d04.020')} style={{ marginTop: 130 }}>
          <Heading n="04" label={t('c04.041')} />
          <div style={{ ...result.frame, marginTop: 50 }}>
            <div aria-hidden="true" style={{ ...result.at({ top: 40, height: 520 }), left: '6%', width: '80%', background: '#E6D8C5', transform: 'rotate(1.5deg)' }} />
            <figure className="d-pr" style={{ ...result.at({ left: 30, top: 0, width: 760 }), '--r': '-1.5deg', margin: 0, background: '#FAF7F0', padding: 16, boxSizing: 'border-box', transform: 'rotate(-1.5deg)', boxShadow: '0 40px 70px -30px rgba(57,52,47,.6)', zIndex: 2 } as CSSProperties}>
              <div aria-hidden="true" style={{ position: 'absolute', left: 60, top: -13, width: 120, height: 26, background: 'rgba(82,91,80,.35)', transform: 'rotate(-4deg)' }} />
              <div aria-hidden="true" style={{ position: 'absolute', right: 60, top: -13, width: 100, height: 26, background: 'rgba(199,143,145,.5)', transform: 'rotate(5deg)' }} />
              <img src={asset('shot-cover-closed.jpg')} alt={t('d04.015')} style={{ display: 'block', width: '100%', aspectRatio: '16 / 10', objectFit: 'cover' }} />
            </figure>
            <figure className="d-pr" style={{ ...result.at({ right: 20, top: 110, width: 240 }), '--r': '4deg', margin: 0, padding: 10, background: '#39342F', borderRadius: 30, boxSizing: 'border-box', transform: 'rotate(4deg)', boxShadow: '0 40px 60px -26px rgba(57,52,47,.65)', zIndex: 3 } as CSSProperties}>
              <img src={asset('shot-mobile-cover.jpg')} alt={t('d04.016')} style={{ display: 'block', width: '100%', aspectRatio: '390 / 844', objectFit: 'cover', borderRadius: 22 }} />
            </figure>
          </div>

          <div className="d-rv" style={{ '--r': '.8deg', position: 'relative', margin: '50px auto 0', width: 640, maxWidth: '100%', background: '#FAF7F0', padding: '44px 50px 38px', boxSizing: 'border-box', transform: 'rotate(.8deg)', boxShadow: '0 2px 3px rgba(57,52,47,.12), 0 34px 60px -30px rgba(57,52,47,.5)' } as CSSProperties}>
            <p style={{ margin: 0, fontFamily: serif, fontSize: 30, lineHeight: 1.35 }}>{t('c04.044')}</p>
            <p style={{ margin: '22px 0 0', textAlign: 'right', fontFamily: "'Dancing Script', cursive", fontSize: 28, color: '#9B7663' }}>{t('c04.045')}</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }}>
            <a className="d-rv" href="/story/5" onClick={(e) => { e.preventDefault(); next() }} style={{ minHeight: 48, display: 'inline-flex', alignItems: 'center', fontFamily: hand, fontSize: 23, color: '#39342F', textDecoration: 'none', borderBottom: '1px solid #9B7663' }}>{t('c04.046')}</a>
          </div>
        </section>
      </div>
    </div>
  )
}

type ShotProps = { box: CSSProperties; r: number; z: number; src: string; alt: string; ratio: string; pos: string; caption: string; tape?: ReactNode }
function Shot({ box, r, z, src, alt, ratio, pos, caption, tape }: ShotProps) {
  return (
    <figure className="d-pr" style={{ ...box, '--r': `${r}deg`, margin: 0, background: '#FAF7F0', padding: '12px 12px 0', boxSizing: 'border-box', transform: `rotate(${r}deg)`, boxShadow: '0 26px 44px -20px rgba(57,52,47,.55)', zIndex: z } as CSSProperties}>
      {tape}
      <img src={src} alt={alt} style={{ display: 'block', width: '100%', aspectRatio: ratio, objectFit: 'cover', objectPosition: pos }} />
      <figcaption style={{ padding: '10px 4px 16px', fontFamily: hand, fontSize: 20, color: '#525B50' }}>{caption}</figcaption>
    </figure>
  )
}
