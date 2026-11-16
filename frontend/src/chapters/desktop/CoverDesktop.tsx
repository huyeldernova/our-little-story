import type { CSSProperties } from 'react'
import { useStory } from '../../story/StoryContext'
import type { ChapterProps } from '../types'

/** Chapter 01, desktop layout (Main.dc.html): the 3D notebook cover beside a postcard. */
export default function CoverDesktop({ coverOpen, openCover, closeCover, next }: ChapterProps) {
  const { t, asset } = useStory()
  const caption = t('c01.008')
  const strip = ['aodai.jpg', 'croissant.jpg', 'matcha.jpg', 'aquarium.jpg']
  const stripPos = ['50% 45%', '50% 40%', '50% 45%', '50% 30%']

  return (
    <section aria-label={t('c01.009')} style={{ position: 'relative', minHeight: 'max(100dvh, 860px)', background: '#F3EBDD', overflow: 'clip' }}>
      <div aria-hidden="true" style={{ position: 'absolute', left: '6%', top: 70, width: '48%', height: 740, background: '#E6D8C5', transform: 'rotate(-3deg)' }} />

      <div aria-hidden="true" style={{ position: 'absolute', left: -30, bottom: 46, width: 440, height: 92, background: '#39342F', transform: 'rotate(-7deg)', display: 'flex', gap: 10, padding: '14px 18px', boxSizing: 'border-box', opacity: 0.92 }}>
        {strip.map((f, i) => (
          <img key={f} src={asset(f)} alt="" style={{ flex: 1, minWidth: 0, height: 64, objectFit: 'cover', objectPosition: stripPos[i], filter: 'sepia(.2)' }} />
        ))}
      </div>

      <div style={{ position: 'relative', maxWidth: 1240, margin: '0 auto', padding: '88px 48px 96px', boxSizing: 'border-box', display: 'flex', flexWrap: 'wrap', gap: 80, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 'min(500px, 100%)', aspectRatio: '500 / 680', perspective: 2400, flex: '0 0 auto' }}>
          {/* first page, revealed when the cover opens */}
          <div style={{ position: 'absolute', inset: 0, background: '#FAF7F0', backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 33px, rgba(155,118,99,.2) 33px 34px)', borderRadius: '2px 6px 6px 2px', boxShadow: '0 2px 3px rgba(57,52,47,.12), 0 30px 60px -24px rgba(57,52,47,.45)', padding: '72px 52px 48px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
            <div aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 26, background: 'linear-gradient(90deg, rgba(57,52,47,.16), transparent)' }} />
            <p style={{ margin: '-17px 0 0', fontFamily: "'Dancing Script', cursive", fontSize: 44, lineHeight: '68px', color: '#39342F' }}>{t('c01.001')}</p>
            <p style={{ margin: '34px 0 0', fontFamily: "'Patrick Hand', cursive", fontSize: 27, lineHeight: '34px', color: '#525B50' }}>{t('c01.002')}</p>
            <p style={{ margin: 0, fontFamily: "'Patrick Hand', cursive", fontSize: 23, lineHeight: '34px', color: '#525B50' }}>{t('c01.003')}</p>
            <p style={{ margin: '34px 0 0', textAlign: 'right', fontFamily: "'Dancing Script', cursive", fontSize: 32, lineHeight: '34px', color: '#9B7663' }}>{t('c01.004')}</p>
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 18, color: '#525B50' }}>{t('d01.001')}</span>
              <a className="d-link" href="/story/2" onClick={(e) => { e.preventDefault(); next() }} tabIndex={coverOpen ? 0 : -1} style={{ fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: '#39342F' }}>{t('d01.002')}</a>
            </div>
          </div>

          {/* the cover */}
          <div style={{ position: 'absolute', inset: 0, transformOrigin: 'left center', transformStyle: 'preserve-3d', transition: 'transform 1.5s cubic-bezier(.6,.05,.2,1)', transform: coverOpen ? 'rotateY(-162deg)' : 'rotateY(0deg)', zIndex: 2, pointerEvents: coverOpen ? 'none' : undefined }}>
            <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', background: '#525B50', backgroundImage: 'repeating-linear-gradient(90deg, rgba(250,247,240,.035) 0 2px, transparent 2px 5px), repeating-linear-gradient(0deg, rgba(57,52,47,.06) 0 1px, transparent 1px 4px)', borderRadius: '2px 6px 6px 2px', boxShadow: 'inset 6px 0 0 rgba(57,52,47,.35), 0 2px 3px rgba(57,52,47,.2), 0 34px 70px -26px rgba(57,52,47,.6)', padding: '34px 40px 40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: 11, letterSpacing: '.26em', textTransform: 'uppercase', color: '#E6D8C5' }}>
                <span>{t('c01.005')}</span>
                <span>{t('c01.006')}</span>
              </div>
              <div className="d-drop" style={{ '--r': '-2.5deg', position: 'relative', marginTop: 26, width: '76%', background: '#FAF7F0', padding: caption ? '12px 12px 0' : '12px 12px 44px', boxSizing: 'border-box', boxShadow: '0 2px 3px rgba(57,52,47,.2), 0 18px 34px -14px rgba(0,0,0,.5)', transform: 'rotate(-2.5deg)', animationDelay: '.3s' } as CSSProperties}>
                <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: -14, width: 116, height: 28, marginLeft: -58, background: 'rgba(199,143,145,.6)', transform: 'rotate(-5deg)' }} />
                <img src={asset('balcony.jpg')} alt={t('d01.008')} style={{ display: 'block', width: '100%', aspectRatio: '1 / .86', objectFit: 'cover', objectPosition: '50% 38%', filter: 'sepia(.12) saturate(.9)' }} />
                {caption && (
                  <p className="d-ink" style={{ margin: 0, padding: '10px 4px 14px', fontFamily: "'Patrick Hand', cursive", fontSize: 23, color: '#525B50', animationDelay: '1.2s' }}>{caption}</p>
                )}
              </div>
              <h1 style={{ margin: '30px 0 0', fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontSize: 58, lineHeight: 1, color: '#FAF7F0', textAlign: 'center' }}>{t('c01.009')}</h1>
              <p style={{ margin: '12px 0 0', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 20, color: '#E6D8C5', textAlign: 'center' }}>{t('c01.010')}</p>
            </div>
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: '#4A5248', borderRadius: '6px 2px 2px 6px', boxShadow: 'inset -6px 0 0 rgba(57,52,47,.3)' }} />
          </div>
        </div>

        <div className="d-rise" style={{ width: 340, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 30, animationDelay: '.5s' }}>
          <span style={{ fontSize: 11, letterSpacing: '.26em', textTransform: 'uppercase', color: '#525B50' }}>{t('d01.003')}</span>

          <div style={{ position: 'relative', width: 300, maxWidth: '100%', height: 186, background: '#FAF7F0', boxShadow: '0 1px 2px rgba(57,52,47,.12), 0 16px 30px -16px rgba(57,52,47,.4)', transform: 'rotate(2.5deg)', padding: '20px 22px', boxSizing: 'border-box', display: 'flex', gap: 18 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, borderRight: '1px solid #E6D8C5', paddingRight: 16 }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 16, color: '#525B50' }}>{t('d01.004')}</span>
              <span style={{ fontFamily: "Caveat, 'Patrick Hand', cursive", fontSize: 20, lineHeight: 1.1, color: '#39342F' }}>{t('d01.005')}</span>
            </div>
            <div aria-hidden="true" style={{ width: 100, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ width: 52, height: 62, border: '2px dotted #C78F91', background: '#E6D8C5' }} />
              <div style={{ width: '100%', height: 1, background: '#CDBBA3' }} />
              <div style={{ width: '100%', height: 1, marginTop: 24, background: '#CDBBA3' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
            <button className="d-btn" type="button" onClick={coverOpen ? closeCover : openCover} aria-pressed={coverOpen} style={{ minHeight: 48, padding: '0 30px', background: '#39342F', color: '#FAF7F0', border: 0, borderRadius: 2, fontFamily: 'Inter, sans-serif', fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', cursor: 'pointer' }}>
              {coverOpen ? t('d01.006') : t('c01.011')}
            </button>
            <span style={{ fontSize: 13, color: '#6B6158' }}>{t('d01.007')}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6B6158' }}>
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></svg>
              {t('c01.012')}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
