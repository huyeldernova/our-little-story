import type { CSSProperties, ReactNode } from 'react'
import { useStory } from '../../story/StoryContext'
import type { ChapterProps } from '../types'
import { place } from './place'

const hand = "'Patrick Hand', cursive"
const serif = "'Cormorant Garamond', serif"
const polShadow = '0 2px 3px rgba(57,52,47,.14), 0 24px 40px -18px rgba(57,52,47,.55)'
// Collage box of AboutYou.dc.html at 1440px: 1160 max-width − 2×56 padding, 1380 high.
const { frame, at } = place(1048, 1380)

type PolProps = {
  i: number
  r: number
  box: CSSProperties
  pad: string
  z: number
  label: string
  src: string
  alt: string
  ratio: string
  pos: string
  tape?: ReactNode
  open: (i: number) => void
}

/** A polaroid that opens the shared lightbox at story.lightbox[i]. */
function Pol({ i, r, box, pad, z, label, src, alt, ratio, pos, tape, open }: PolProps) {
  return (
    <button className="d-pol" type="button" onClick={() => open(i)} aria-label={label} style={{ ...box, '--r': `${r}deg`, padding: pad, background: '#FAF7F0', border: 0, cursor: 'zoom-in', transform: `rotate(${r}deg)`, boxShadow: polShadow, zIndex: z, boxSizing: 'border-box' } as CSSProperties}>
      {tape}
      <img src={src} alt={alt} style={{ display: 'block', width: '100%', aspectRatio: ratio, objectFit: 'cover', objectPosition: pos }} />
    </button>
  )
}

/** Chapter 03, desktop layout (AboutYou.dc.html): diary note, Instagram collage, the croissant smile. */
export default function CuriousDesktop({ next, openPhoto }: ChapterProps) {
  const { t, asset } = useStory()
  const pinkTape = (s: CSSProperties) => <span aria-hidden="true" style={{ position: 'absolute', height: 24, background: 'rgba(199,143,145,.55)', ...s }} />

  return (
    <div style={{ position: 'relative', background: '#F3EBDD', overflow: 'clip' }}>
      <div style={{ position: 'relative', maxWidth: 1160, margin: '0 auto', padding: '100px 56px 130px', boxSizing: 'border-box' }}>
        <header className="d-rise" style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 30 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span style={{ fontSize: 11, letterSpacing: '.3em', color: '#525B50' }}>{t('c03.001')}</span>
            <h2 style={{ margin: 0, fontFamily: serif, fontWeight: 500, fontSize: 66, lineHeight: 1.02 }}>
              {t('c03.002')} <em style={{ fontWeight: 400, color: '#9B7663' }}>{t('c03.003')}</em> {t('c03.004')}
            </h2>
            <p style={{ margin: 0, fontFamily: serif, fontStyle: 'italic', fontSize: 26, color: '#525B50' }}>{t('c03.005')}</p>
          </div>
          <span style={{ display: 'inline-block', marginBottom: 18, padding: '8px 14px', border: '1.5px dashed #9B7663', fontFamily: hand, fontSize: 21, color: '#9B7663', transform: 'rotate(-4deg)' }}>{t('c03.006')}</span>
        </header>

        <section aria-label={t('d03.014')} style={{ position: 'relative', marginTop: 70, display: 'flex', justifyContent: 'flex-start' }}>
          <div className="d-note-in" style={{ '--r': '-1.2deg', position: 'relative', width: 640, maxWidth: '100%', background: '#FAF7F0', backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 35px, rgba(155,118,99,.2) 35px 36px)', padding: '40px 48px 40px 70px', boxSizing: 'border-box', transform: 'rotate(-1.2deg)', boxShadow: '0 2px 3px rgba(57,52,47,.12), 0 26px 46px -24px rgba(57,52,47,.45)' } as CSSProperties}>
            <div aria-hidden="true" style={{ position: 'absolute', left: 46, top: 0, bottom: 0, width: 1, background: 'rgba(199,143,145,.6)' }} />
            <div aria-hidden="true" style={{ position: 'absolute', left: '40%', top: -13, width: 110, height: 26, background: 'rgba(82,91,80,.32)', transform: 'rotate(-3deg)' }} />
            <span style={{ display: 'block', fontSize: 10, letterSpacing: '.3em', color: '#9B7663', lineHeight: '36px' }}>{t('c03.007')}</span>
            <p style={{ margin: 0, fontFamily: hand, fontSize: 22, lineHeight: '36px', color: '#39342F' }}>{t('c03.008')}</p>
            <p style={{ margin: '36px 0 0', fontFamily: hand, fontSize: 22, lineHeight: '36px', color: '#39342F' }}>{t('c03.009')}</p>
          </div>
          <div className="d-rv" style={{ '--r': '5deg', position: 'absolute', left: 'min(600px, calc(100% - 330px))', top: 200, padding: '14px 18px', background: '#E6D8C5', transform: 'rotate(5deg)', boxShadow: '0 12px 22px -12px rgba(57,52,47,.4)', zIndex: 2 } as CSSProperties}>
            <span style={{ fontFamily: hand, fontSize: 22, color: '#525B50' }}>{t('c03.010')}</span>
          </div>
        </section>

        <section aria-label={t('d03.015')} style={{ ...frame, marginTop: 110 }}>
          <div aria-hidden="true" style={{ ...at({ top: 60, height: 1180 }), left: '6%', width: '84%', background: '#E6D8C5', transform: 'rotate(1.2deg)' }} />
          <div aria-hidden="true" style={{ ...at({ top: 380, height: 520 }), left: '30%', width: '46%', background: '#FAF7F0', opacity: 0.5, transform: 'rotate(-3deg)' }} />

          <Pol i={0} r={-4} box={at({ left: 0, top: 0, width: 290 })} pad="12px 12px 34px" z={2} label={t('d03.001')} src={asset('aodai.jpg')} alt={t('c03.012')} ratio="3 / 4.4" pos="50% 42%" open={openPhoto}
            tape={pinkTape({ left: '50%', top: -12, width: 100, marginLeft: -50, transform: 'rotate(-4deg)' })} />

          <p className="d-cap" style={{ ...at({ left: 310, top: 40, width: 230 }), '--r': '-2deg', margin: 0, fontFamily: hand, fontSize: 22, lineHeight: 1.3, color: '#9B7663', transform: 'rotate(-2deg)', zIndex: 5 } as CSSProperties}>{t('c03.013')}</p>

          <Pol i={1} r={3} box={at({ left: 340, top: 170, width: 250 })} pad="11px 11px 30px" z={3} label={t('d03.002')} src={asset('balcony.jpg')} alt={t('d03.008')} ratio="3 / 4.4" pos="50% 40%" open={openPhoto} />

          <Pol i={2} r={-2} box={at({ left: 650, top: 10, width: 330 })} pad="13px 13px 38px" z={2} label={t('d03.003')} src={asset('plants.jpg')} alt={t('d03.009')} ratio="3 / 4.2" pos="50% 25%" open={openPhoto}
            tape={<span aria-hidden="true" style={{ position: 'absolute', right: -16, top: 10, width: 80, height: 22, background: 'rgba(82,91,80,.35)', transform: 'rotate(40deg)' }} />} />

          <Pol i={3} r={5} box={at({ left: 70, top: 520, width: 240 })} pad="11px 11px 30px" z={3} label={t('d03.004')} src={asset('matcha.jpg')} alt={t('d03.010')} ratio="3 / 4" pos="50% 45%" open={openPhoto} />

          <Pol i={4} r={-3} box={at({ left: 380, top: 610, width: 300 })} pad="12px 12px 34px" z={4} label={t('d03.005')} src={asset('sunglasses.jpg')} alt={t('d03.011')} ratio="1 / 1" pos="48% 40%" open={openPhoto}
            tape={pinkTape({ left: 30, top: -12, width: 90, transform: 'rotate(5deg)' })} />

          <Pol i={5} r={4} box={at({ left: 740, top: 520, width: 270 })} pad="12px 12px 32px" z={3} label={t('d03.006')} src={asset('bench.jpg')} alt={t('d03.012')} ratio="3 / 4.2" pos="50% 30%" open={openPhoto} />

          <div className="d-cap" style={{ ...at({ left: 730, top: 1010, width: 250 }), '--r': '3deg', display: 'flex', flexDirection: 'column', gap: 4, transform: 'rotate(3deg)', zIndex: 5 } as CSSProperties}>
            <svg aria-hidden="true" width="60" height="36" viewBox="0 0 60 36" fill="none" stroke="#9B7663" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 70 }}><path d="M30 34 C 26 22, 30 10, 40 3" /><path d="M32 4l8-1 0 8" /></svg>
            <span style={{ fontFamily: hand, fontSize: 22, lineHeight: 1.3, color: '#9B7663' }}>{t('c03.025')}</span>
          </div>

          <p className="d-cap" style={{ ...at({ left: 20, top: 1010, width: 220 }), '--r': '-3deg', margin: 0, fontFamily: hand, fontSize: 23, color: '#525B50', transform: 'rotate(-3deg)', zIndex: 5 } as CSSProperties}>{t('c03.018')}</p>

          <Pol i={6} r={-2} box={at({ left: 260, top: 1010, width: 290 })} pad="12px 12px 34px" z={3} label={t('d03.007')} src={asset('aquarium.jpg')} alt={t('d03.013')} ratio="4 / 3.3" pos="50% 30%" open={openPhoto} />

          <p className="d-cap" style={{ ...at({ left: 400, top: 1310, width: 340 }), '--r': '2deg', margin: 0, fontFamily: hand, fontSize: 22, lineHeight: 1.3, color: '#39342F', transform: 'rotate(2deg)', zIndex: 5 } as CSSProperties}>{t('c03.028')}</p>
        </section>

        <section aria-label={t('d03.016')} style={{ position: 'relative', marginTop: 130, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 70 }}>
          <button className="d-smile" type="button" onClick={() => openPhoto(7)} aria-label={t('c03.029')} style={{ position: 'relative', flex: '0 0 auto', width: 440, maxWidth: '100%', padding: '16px 16px 60px', background: '#FAF7F0', border: 0, cursor: 'zoom-in', transform: 'rotate(-2.5deg)', boxShadow: '0 0 0 1px rgba(155,118,99,.08), 0 3px 4px rgba(57,52,47,.12), 0 50px 80px -34px rgba(57,52,47,.6)' }}>
            {pinkTape({ left: '50%', top: -14, width: 140, height: 28, marginLeft: -70, transform: 'rotate(-3deg)' })}
            <img src={asset('croissant.jpg')} alt={t('c03.030')} style={{ display: 'block', width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', objectPosition: '50% 30%' }} />
            <span style={{ position: 'absolute', left: 22, bottom: 16, fontFamily: hand, fontSize: 22, color: '#9B7663' }}>{t('c03.031')}</span>
          </button>
          <div style={{ flex: '1 1 340px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 22 }}>
            <p className="d-rv" style={{ margin: 0, fontFamily: serif, fontSize: 40, lineHeight: 1.15, color: '#39342F' }}>{t('c03.032')}</p>
            <p className="d-rv" style={{ margin: 0, fontFamily: serif, fontSize: 24, lineHeight: 1.5, color: '#4A443D' }}>{t('c03.033')}</p>
            <div className="d-rv" style={{ '--r': '-3deg', alignSelf: 'flex-start', marginTop: 10, padding: '12px 16px', background: '#FAF7F0', transform: 'rotate(-3deg)', boxShadow: '0 12px 22px -12px rgba(57,52,47,.4)' } as CSSProperties}>
              <span style={{ fontFamily: hand, fontSize: 22, color: '#525B50' }}>{t('c03.034')}</span>
            </div>
          </div>
        </section>

        <section aria-label={t('d03.017')} style={{ marginTop: 150, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="d-rv" style={{ '--r': '.8deg', position: 'relative', width: 620, maxWidth: '100%', background: '#FAF7F0', padding: '54px 58px 46px', boxSizing: 'border-box', transform: 'rotate(.8deg)', boxShadow: '0 2px 3px rgba(57,52,47,.12), 0 40px 70px -32px rgba(57,52,47,.5)' } as CSSProperties}>
            <div aria-hidden="true" style={{ position: 'absolute', left: 36, top: -12, width: 96, height: 24, background: 'rgba(82,91,80,.32)', transform: 'rotate(-5deg)' }} />
            <div aria-hidden="true" style={{ position: 'absolute', right: 30, top: -12, width: 80, height: 24, background: 'rgba(199,143,145,.5)', transform: 'rotate(6deg)' }} />
            <p style={{ margin: 0, fontFamily: serif, fontSize: 27, lineHeight: 1.45, color: '#39342F' }}>{t('c03.035')}</p>
            <p style={{ margin: '18px 0 0', fontFamily: serif, fontSize: 24, lineHeight: 1.5, color: '#4A443D' }}>{t('c03.036')}</p>
            <p style={{ margin: '30px 0 0', textAlign: 'right', fontFamily: "'Dancing Script', cursive", fontSize: 32, color: '#9B7663' }}>{t('c03.037')}</p>
          </div>
          <a className="d-rv" href="/story/4" onClick={(e) => { e.preventDefault(); next() }} style={{ marginTop: 56, minHeight: 48, display: 'inline-flex', alignItems: 'center', fontFamily: hand, fontSize: 23, color: '#39342F', textDecoration: 'none', borderBottom: '1px solid #9B7663' }}>{t('c03.038')}</a>
        </section>
      </div>
    </div>
  )
}
