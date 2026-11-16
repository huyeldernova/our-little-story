import { useStory } from '../../story/StoryContext'
import type { ChapterProps } from '../types'
import { useLetterSeal } from '../useLetterSeal'

const hand = "'Patrick Hand', cursive"
const script = "'Dancing Script', cursive"
const star = 'M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z'

/**
 * Chapter 05, desktop layout (Letter.dc.html). The wax seal is held (~1.3 s, progress ring,
 * Enter / Space also break it), the letter is pulled out of the envelope, and "fold it back"
 * returns it. The seal state comes from StoryLayout, shared with the mobile layout.
 * When open, the letter lies beside the envelope, never on top of it.
 */
export default function LetterDesktop({ next, letter: seal, setLetter }: ChapterProps) {
  const { t, asset, story } = useStory()
  const s = useLetterSeal(seal, setLetter)
  const L = story?.letter ?? {}
  const sealed = seal === 'sealed' || seal === 'cracking'
  const subtitle = seal === 'out' ? L.subOut : seal === 'peek' ? L.subPeek : L.subSealed
  const holdHint = s.hold > 0 ? L.holdActive : L.holdIdle

  return (
    <div style={{ position: 'relative', minHeight: 1100, background: '#39342F', color: '#FAF7F0', overflow: 'clip' }}>
      <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: 120, width: 1300, height: 1000, marginLeft: -650, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(230,216,197,.22), rgba(230,216,197,0))' }} />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg, rgba(250,247,240,.018) 0 1px, transparent 1px 7px)' }} />
      <svg aria-hidden="true" width="190" height="260" viewBox="0 0 190 260" fill="none" stroke="#9B7663" strokeWidth="1.4" strokeLinecap="round" style={{ position: 'absolute', left: '7%', top: 640, opacity: 0.6, transform: 'rotate(-18deg)' }}>
        <path d="M95 255 C 92 190, 98 120, 90 30" />
        <path d="M93 200 C 70 190, 55 170, 52 150 C 72 156, 86 172, 93 200" />
        <path d="M94 160 C 116 150, 132 128, 134 108 C 114 116, 100 134, 94 160" />
        <path d="M92 118 C 72 106, 62 86, 62 66 C 80 76, 90 96, 92 118" />
        <path d="M90 60 C 82 46, 84 34, 90 24 C 98 34, 98 46, 90 60" />
      </svg>

      <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '96px 48px 110px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="d-rise" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
          <span style={{ fontSize: 11, letterSpacing: '.3em', color: '#CDBBA3' }}>{t('c05.001')}</span>
          <h2 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontSize: 68, lineHeight: 1, color: '#FAF7F0' }}>
            {t('c05.002')} <em style={{ fontWeight: 400, color: '#C78F91' }}>{t('c05.003')}</em>
          </h2>
          <p aria-live="polite" style={{ margin: '4px 0 0', fontFamily: hand, fontSize: 22, color: '#CDBBA3' }}>{subtitle}</p>
        </div>

        {sealed && (
          <div style={{ marginTop: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, width: '100%' }}>
            <div className="d-env" style={{ position: 'relative', width: 'min(600px, 100%)', aspectRatio: '600 / 380' }}>
              <div className="d-float" style={{ position: 'absolute', inset: 0 }}>
                <span aria-hidden="true" style={{ position: 'absolute', inset: 0, background: '#E6D8C5', boxShadow: '0 2px 4px rgba(0,0,0,.25), 0 50px 80px -30px rgba(0,0,0,.75)' }} />
                <span aria-hidden="true" style={{ position: 'absolute', inset: 0, background: '#DDCBB3', clipPath: 'polygon(0 100%, 50% 48%, 100% 100%)' }} />
                <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '58%', background: '#D5C1A6', clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
                <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 2, background: '#9B7663', opacity: 0.85 }} />
                <span aria-hidden="true" style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, marginLeft: -1, background: '#9B7663', opacity: 0.85 }} />
                <span aria-hidden="true" style={{ position: 'absolute', left: '7%', bottom: '10%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                  <span style={{ fontSize: 10, letterSpacing: '.26em', color: '#6B6158' }}>{t('c05.004')}</span>
                  <span style={{ fontFamily: script, fontSize: 40, lineHeight: 1, color: '#39342F' }}>{t('c05.005')}</span>
                </span>
                <span aria-hidden="true" style={{ position: 'absolute', right: '6%', top: '8%', width: 70, height: 84, background: '#FAF7F0', border: '3px dotted #C78F91', boxSizing: 'border-box', transform: 'rotate(4deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 13, color: '#9B7663' }}>{t('d05.001')}</span>

                <button type="button" onPointerDown={s.holdStart} onPointerUp={s.holdEnd} onPointerLeave={s.holdEnd} onPointerCancel={s.holdEnd} onKeyDown={s.holdKey} onContextMenu={s.noMenu} aria-label={t('c05.006')}
                  style={{ position: 'absolute', left: '50%', top: '56%', width: 128, height: 128, margin: '-64px 0 0 -64px', padding: 0, border: 0, borderRadius: '50%', background: 'transparent', cursor: 'pointer', touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg aria-hidden="true" width="128" height="128" viewBox="0 0 112 112" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                    <circle cx="56" cy="56" r="52" fill="none" stroke="rgba(57,52,47,.18)" strokeWidth="3" />
                    <circle cx="56" cy="56" r="52" fill="none" stroke="#9B7663" strokeWidth="3" strokeLinecap="round" strokeDasharray="327" strokeDashoffset={s.ringOff} />
                  </svg>
                  <span className={s.sealClass} style={{ width: 92, height: 92, borderRadius: '50%', background: '#B47A7D', boxShadow: 'inset 0 0 0 7px rgba(57,52,47,.16), inset 0 -6px 12px rgba(57,52,47,.25), 0 6px 12px rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: script, fontSize: 40, color: '#F3EBDD', transform: `scale(${s.sealScale})`, transition: 'transform .1s linear' }}>
                    {t('c05.007')}
                  </span>
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <p style={{ margin: 0, fontFamily: hand, fontSize: 24, color: '#FAF7F0', textAlign: 'center' }}>{holdHint}</p>
              <span style={{ fontSize: 13, color: '#CDBBA3' }}>{t('c05.008')}</span>
            </div>
          </div>
        )}

        {seal === 'peek' && (
          <div style={{ marginTop: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div style={{ position: 'relative', width: 'min(600px, 100%)', aspectRatio: '600 / 380' }}>
              <div aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: '100%', height: '58%', background: '#D5C1A6', clipPath: 'polygon(0 100%, 100% 100%, 50% 0)' }} />
              <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: '#CDBBA3', boxShadow: '0 50px 80px -30px rgba(0,0,0,.75)' }} />
              <div data-nonav="1" onPointerDown={s.pullStart} onPointerMove={s.pullMove} onPointerUp={s.pullEnd} onPointerCancel={s.pullEnd}
                style={{ position: 'absolute', left: 34, right: 34, top: -80, height: '108%', background: '#FAF7F0', backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 33px, rgba(155,118,99,.2) 33px 34px)', padding: '24px 30px', boxSizing: 'border-box', cursor: s.dragging ? 'grabbing' : 'grab', touchAction: 'none', userSelect: 'none', transform: `translateY(${s.pull}px)`, transition: s.dragging ? 'none' : 'transform .45s cubic-bezier(.2,.7,.2,1)', boxShadow: '0 -6px 16px -8px rgba(0,0,0,.4)' }}>
                <span style={{ fontFamily: script, fontSize: 36, color: '#39342F' }}>{t('c05.009')}</span>
              </div>
              <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: '#E6D8C5', clipPath: 'polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)', pointerEvents: 'none' }} />
              <div aria-hidden="true" style={{ position: 'absolute', left: '7%', bottom: '10%', fontFamily: script, fontSize: 36, color: '#39342F', pointerEvents: 'none' }}>{t('c05.005')}</div>
            </div>
            <div className="nudge-up" style={{ marginTop: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#FAF7F0' }}>
              <svg aria-hidden="true" width="18" height="26" viewBox="0 0 18 26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 25V2M3 8l6-6 6 6" /></svg>
              <span style={{ fontFamily: hand, fontSize: 24 }}>{t('c05.010')}</span>
            </div>
            <button type="button" onClick={s.takeOut} className="d-ghost" style={{ marginTop: 10, minHeight: 44, padding: '0 16px', background: 'transparent', border: 0, color: '#CDBBA3', fontSize: 13, textDecoration: 'underline', cursor: 'pointer' }}>
              {t('c05.011')}
            </button>
          </div>
        )}

        {seal === 'out' && (
          <>
            <div className="d-letter-wrap" style={{ position: 'relative', marginTop: 72, width: '100%', maxWidth: 760 }}>
              <div className="d-side-env d-tuck" aria-hidden="true">
                <span style={{ position: 'absolute', inset: 0, background: '#E6D8C5', boxShadow: '0 30px 50px -24px rgba(0,0,0,.7)' }} />
                <span style={{ position: 'absolute', left: 0, right: 0, bottom: '100%', height: 100, background: '#D5C1A6', clipPath: 'polygon(0 100%, 100% 100%, 50% 0)' }} />
                <span style={{ position: 'absolute', inset: 0, background: '#DDCBB3', clipPath: 'polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)' }} />
                <span style={{ position: 'absolute', left: '10%', bottom: '12%', fontFamily: script, fontSize: 30, color: '#39342F' }}>{t('c05.005')}</span>
              </div>

              <article className="d-slide-out" aria-label={t('c05.012')} style={{ position: 'relative', zIndex: 1, background: '#FAF7F0', backgroundImage: 'radial-gradient(circle at 18% 12%, rgba(155,118,99,.07), transparent 38%), radial-gradient(circle at 85% 70%, rgba(155,118,99,.06), transparent 42%), repeating-linear-gradient(0deg, rgba(57,52,47,.012) 0 1px, transparent 1px 3px)', color: '#39342F', padding: '80px 84px 120px', boxSizing: 'border-box', transform: 'rotate(.6deg)', boxShadow: '0 2px 4px rgba(0,0,0,.2), 0 60px 90px -40px rgba(0,0,0,.8)' }}>
                <div aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: '33.3%', height: 16, marginTop: -8, background: 'linear-gradient(180deg, rgba(57,52,47,0), rgba(57,52,47,.055), rgba(57,52,47,0))' }} />
                <div aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: '66.6%', height: 16, marginTop: -8, background: 'linear-gradient(180deg, rgba(57,52,47,0), rgba(57,52,47,.055), rgba(57,52,47,0))' }} />
                <div aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 18, background: 'linear-gradient(90deg, rgba(57,52,47,.05), transparent)' }} />

                <div className="d-pin" style={{ position: 'absolute', right: -64, top: -46, width: 150, background: '#FFFFFF', padding: '8px 8px 0', boxSizing: 'border-box', transform: 'rotate(6deg)', boxShadow: '0 2px 3px rgba(57,52,47,.18), 0 18px 30px -12px rgba(0,0,0,.55)', zIndex: 2 }}>
                  <div aria-hidden="true" style={{ position: 'absolute', left: 38, top: -11, width: 74, height: 22, background: 'rgba(82,91,80,.32)', transform: 'rotate(-5deg)' }} />
                  <img src={asset('writer.jpg')} alt={t('c05.013')} style={{ display: 'block', width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', objectPosition: '50% 15%', filter: 'sepia(.15)' }} />
                  <p style={{ margin: 0, padding: '6px 2px 10px', fontFamily: hand, fontSize: 17, color: '#525B50' }}>{t('c05.014')}</p>
                </div>

                <div style={{ fontFamily: hand, fontSize: 22, lineHeight: 1.62, color: '#39342F' }}>
                  <p className="rv" style={{ margin: 0, fontFamily: script, fontSize: 40, lineHeight: 1.2 }}>{t('c05.009')}</p>
                  <p className="rv" style={{ margin: '26px 0 0' }}>{t('c05.015')}</p>
                  {['c05.016', 'c05.017', 'c05.018', 'c05.019'].map((k) => (
                    <p key={k} className="rv" style={{ margin: '18px 0 0' }}>{t(k)}</p>
                  ))}
                  <div className="rv" style={{ position: 'relative', margin: '26px 0 0' }}>
                    <p style={{ margin: 0, fontSize: 25 }}><span className="hl">{t('c05.020')}</span></p>
                    <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: '4px 0 0 30px', fontSize: 18, color: '#9B7663', transform: 'rotate(-2deg)' }}>
                      <svg width="26" height="22" viewBox="0 0 26 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 20 C 12 18, 6 12, 5 3" /><path d="M1 7l4-5 4 5" /></svg>
                      {t('c05.021')}
                    </span>
                  </div>
                  {['c05.022', 'c05.023', 'c05.024', 'c05.025', 'c05.026', 'c05.027'].map((k) => (
                    <p key={k} className="rv" style={{ margin: '18px 0 0' }}>{t(k)}</p>
                  ))}
                  <div className="rv" style={{ position: 'relative', margin: '26px 0 0' }}>
                    <p style={{ margin: 0, fontSize: 25 }}><span className="hl">{t('c05.028')}</span></p>
                    <span aria-hidden="true" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, margin: '4px 20px 0 0', fontSize: 18, color: '#9B7663', transform: 'rotate(1.5deg)' }}>
                      {t('c05.029')}
                      <svg width="26" height="22" viewBox="0 0 26 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20 C 14 18, 20 12, 21 3" /><path d="M17 7l4-5 4 5" /></svg>
                    </span>
                  </div>
                  <p className="rv" style={{ margin: '18px 0 0' }}>{t('c05.030')}</p>
                  <p className="rv" style={{ margin: '26px 0 0', fontSize: 25, color: '#525B50' }}>{t('c05.031')}</p>
                  <div className="rv" style={{ marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span>{t('c05.032')}</span>
                    <span style={{ fontFamily: script, fontSize: 56, lineHeight: 1.1, color: '#39342F', transform: 'rotate(-3deg)', marginTop: 6 }}>{t('c05.033')}</span>
                    <svg aria-hidden="true" width="170" height="20" viewBox="0 0 170 20" fill="none" stroke="#9B7663" strokeWidth="1.5" strokeLinecap="round" style={{ marginTop: -4 }}><path d="M4 12 C 40 4, 70 18, 104 9 S 150 6, 166 12" /></svg>
                  </div>
                </div>
              </article>

              <div className="ps" style={{ position: 'relative', zIndex: 2, width: 420, maxWidth: '86%', margin: '-70px 0 0 auto', transform: 'rotate(-2.5deg)', background: '#E6D8C5', color: '#39342F', padding: '26px 26px 22px', boxSizing: 'border-box', boxShadow: '0 2px 3px rgba(57,52,47,.15), 0 24px 40px -20px rgba(0,0,0,.6)' }}>
                <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: -12, width: 96, height: 24, marginLeft: -48, background: 'rgba(250,247,240,.6)', transform: 'rotate(4deg)' }} />
                <div style={{ fontFamily: hand, fontSize: 20, lineHeight: 1.5 }}>
                  <span style={{ fontFamily: script, fontWeight: 700, fontSize: 26, color: '#9B7663' }}>{t('c05.034')}</span> {t('c05.035')}
                </div>
                <div aria-hidden="true" style={{ marginTop: 12, display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center', color: '#9B7663' }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeDasharray={i === 4 ? '2 2.5' : undefined}><path d={star} /></svg>
                  ))}
                  <span style={{ fontFamily: hand, fontSize: 15, marginLeft: 4 }}>{t('c05.036')}</span>
                </div>
              </div>
            </div>

            <div className="rv" style={{ marginTop: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center' }}>
              <span style={{ fontFamily: hand, fontSize: 22, color: '#CDBBA3' }}>{t('c05.037')}</span>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="d-ghost" type="button" onClick={s.foldBack} style={{ minHeight: 48, padding: '0 26px', background: 'transparent', color: '#FAF7F0', border: '1px solid rgba(250,247,240,.45)', borderRadius: 2, fontFamily: 'Inter, sans-serif', fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  {t('c05.039')}
                </button>
                <button type="button" onClick={next} style={{ minHeight: 48, padding: '0 26px', display: 'inline-flex', alignItems: 'center', background: '#FAF7F0', color: '#39342F', border: 0, borderRadius: 2, fontFamily: 'Inter, sans-serif', fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  {t('c05.038')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
