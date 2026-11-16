import { useStory } from '../story/StoryContext'
import type { ChapterProps } from './types'
import { useLetterSeal } from './useLetterSeal'

export default function LetterChapter({ turn, next, letter: seal, setLetter }: ChapterProps) {
  const { t, asset, story } = useStory()
  const { hold, pull, dragging, holdStart, holdEnd, holdKey, noMenu, pullStart, pullMove, pullEnd, takeOut, foldBack, ringOff, sealScale, sealClass } =
    useLetterSeal(seal, setLetter)
  const L = story?.letter ?? {}

  const lt = { sealed: seal === 'sealed' || seal === 'cracking', peek: seal === 'peek', out: seal === 'out' }
  const letterSub = seal === 'out' ? L.subOut : seal === 'peek' ? L.subPeek : L.subSealed
  const holdHint = hold > 0 ? L.holdActive : L.holdIdle
  const pullPx = pull + 'px'
  const pullTr = dragging ? 'none' : 'transform .45s cubic-bezier(.2,.7,.2,1)'
  return (
    <div className={`pg ${turn}`} style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", background: "#39342F", color: "#FAF7F0", padding: "92px 22px 40px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div aria-hidden="true" style={{ position: "absolute", left: "-100px", top: "200px", width: "590px", height: "600px", borderRadius: "50%", background: "radial-gradient(closest-side, rgba(230,216,197,.2), rgba(230,216,197,0))" }}></div>
      <svg aria-hidden="true" width="110" height="150" viewBox="0 0 190 260" fill="none" stroke="#9B7663" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: "-14px", bottom: "30px", opacity: ".6", transform: "rotate(-18deg)" }}>
        <path d="M95 255 C 92 190, 98 120, 90 30" />
        <path d="M93 200 C 70 190, 55 170, 52 150 C 72 156, 86 172, 93 200" />
        <path d="M94 160 C 116 150, 132 128, 134 108 C 114 116, 100 134, 94 160" />
        <path d="M92 118 C 72 106, 62 86, 62 66 C 80 76, 90 96, 92 118" />
      </svg>
      <span style={{ position: "relative", fontSize: "10px", letterSpacing: ".3em", color: "#CDBBA3" }}>
        {t('c05.001')}
      </span>
      <h2 style={{ position: "relative", margin: "10px 0 0", fontFamily: "'Cormorant Garamond', serif", fontWeight: "500", fontSize: "42px", lineHeight: "1", color: "#FAF7F0", textAlign: "center" }}>
        {t('c05.002')}{' '}
        <em style={{ fontWeight: "400", color: "#C78F91" }}>
          {t('c05.003')}
        </em>
      </h2>
      <p style={{ position: "relative", margin: "6px 0 0", fontFamily: "'Patrick Hand', cursive", fontSize: "19px", color: "#CDBBA3" }}>
        {letterSub}
      </p>
      {lt.sealed && (
        <>
        <div style={{ position: "relative", marginTop: "46px", width: "320px", height: "204px" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: "0", background: "#E6D8C5", boxShadow: "0 40px 60px -26px rgba(0,0,0,.75)" }}></div>
          <div aria-hidden="true" style={{ position: "absolute", inset: "0", background: "#DDCBB3", clipPath: "polygon(0 100%, 50% 48%, 100% 100%)" }}></div>
          <div aria-hidden="true" style={{ position: "absolute", left: "0", right: "0", top: "0", height: "58%", background: "#D5C1A6", clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}></div>
          <div aria-hidden="true" style={{ position: "absolute", left: "0", right: "0", top: "50%", height: "2px", background: "#9B7663", opacity: ".85" }}></div>
          <div aria-hidden="true" style={{ position: "absolute", left: "50%", top: "0", bottom: "0", width: "2px", marginLeft: "-1px", background: "#9B7663", opacity: ".85" }}></div>
          <div aria-hidden="true" style={{ position: "absolute", left: "6%", bottom: "9%", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "8px", letterSpacing: ".26em", color: "#6B6158" }}>
              {t('c05.004')}
            </span>
            <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: "30px", lineHeight: "1", color: "#39342F" }}>
              {t('c05.005')}
            </span>
          </div>
          <div aria-hidden="true" style={{ position: "absolute", right: "6%", top: "8%", width: "42px", height: "50px", background: "#FAF7F0", border: "2px dotted #C78F91", transform: "rotate(4deg)" }}></div>
          <button data-nonav="1" type="button" onPointerDown={holdStart} onPointerUp={holdEnd} onPointerLeave={holdEnd} onPointerCancel={holdEnd} onKeyDown={holdKey} onContextMenu={noMenu} aria-label={t('c05.006')} style={{ position: "absolute", left: "50%", top: "56%", width: "112px", height: "112px", margin: "-56px 0 0 -56px", padding: "0", border: "0", borderRadius: "50%", background: "transparent", cursor: "pointer", touchAction: "none", WebkitUserSelect: "none", userSelect: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg aria-hidden="true" width="112" height="112" viewBox="0 0 112 112" style={{ position: "absolute", inset: "0", transform: "rotate(-90deg)" }}>
              <circle cx="56" cy="56" r="52" fill="none" stroke="rgba(250,247,240,.25)" strokeWidth="3" />
              <circle cx="56" cy="56" r="52" fill="none" stroke="#FAF7F0" strokeWidth="3" strokeLinecap="round" strokeDasharray="327" strokeDashoffset={ringOff} />
            </svg>
            <span className={sealClass} style={{ width: "78px", height: "78px", borderRadius: "50%", background: "#B47A7D", boxShadow: "inset 0 0 0 6px rgba(57,52,47,.16), inset 0 -5px 10px rgba(57,52,47,.25), 0 6px 12px rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Dancing Script', cursive", fontSize: "34px", color: "#F3EBDD", transform: `scale(${sealScale})`, transition: "transform .1s linear" }}>
              {t('c05.007')}
            </span>
          </button>
        </div>
        <p style={{ position: "relative", margin: "34px 0 0", fontFamily: "'Patrick Hand', cursive", fontSize: "22px", color: "#FAF7F0", textAlign: "center" }}>
          {holdHint}
        </p>
        <span style={{ position: "relative", marginTop: "6px", fontSize: "12px", color: "#CDBBA3" }}>
          {t('c05.008')}
        </span>
        </>
      )}
      {lt.peek && (
        <>
        <div style={{ position: "relative", marginTop: "150px", width: "320px", height: "204px" }}>
          <div aria-hidden="true" style={{ position: "absolute", left: "0", right: "0", bottom: "100%", height: "118px", background: "#D5C1A6", clipPath: "polygon(0 100%, 100% 100%, 50% 0)" }}></div>
          <div aria-hidden="true" style={{ position: "absolute", inset: "0", background: "#CDBBA3", boxShadow: "0 40px 60px -26px rgba(0,0,0,.75)" }}></div>
          <div data-nonav="1" onPointerDown={pullStart} onPointerMove={pullMove} onPointerUp={pullEnd} onPointerCancel={pullEnd} style={{ position: "absolute", left: "18px", right: "18px", top: "-46px", height: "230px", background: "#FAF7F0", backgroundImage: "repeating-linear-gradient(180deg, transparent 0 21px, rgba(155,118,99,.2) 21px 22px)", padding: "16px 18px", boxSizing: "border-box", cursor: "grab", touchAction: "none", transform: `translateY(${pullPx})`, transition: pullTr, boxShadow: "0 -6px 16px -8px rgba(0,0,0,.4)" }}>
            <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: "26px", color: "#39342F" }}>
              {t('c05.009')}
            </span>
          </div>
          <div aria-hidden="true" style={{ position: "absolute", inset: "0", background: "#E6D8C5", clipPath: "polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)", pointerEvents: "none" }}></div>
          <div aria-hidden="true" style={{ position: "absolute", left: "6%", bottom: "9%", fontFamily: "'Dancing Script', cursive", fontSize: "26px", color: "#39342F", pointerEvents: "none" }}>
            {t('c05.005')}
          </div>
        </div>
        <div className="nudge-up" style={{ position: "relative", marginTop: "30px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: "#FAF7F0" }}>
          <svg aria-hidden="true" width="18" height="26" viewBox="0 0 18 26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 25V2M3 8l6-6 6 6" />
          </svg>
          <span style={{ fontFamily: "'Patrick Hand', cursive", fontSize: "22px" }}>
            {t('c05.010')}
          </span>
        </div>
        <button type="button" onClick={takeOut} style={{ position: "relative", marginTop: "6px", minHeight: "44px", padding: "0 12px", background: "transparent", border: "0", color: "#CDBBA3", fontSize: "12px", textDecoration: "underline", cursor: "pointer" }}>
          {t('c05.011')}
        </button>
        </>
      )}
      {lt.out && (
        <>
        <article className="unfold" aria-label={t('c05.012')} style={{ position: "relative", marginTop: "30px", width: "100%", background: "#FAF7F0", backgroundImage: "radial-gradient(circle at 18% 10%, rgba(155,118,99,.07), transparent 40%), radial-gradient(circle at 85% 70%, rgba(155,118,99,.06), transparent 45%)", color: "#39342F", padding: "40px 24px 70px 26px", boxSizing: "border-box", boxShadow: "0 40px 60px -30px rgba(0,0,0,.8)" }}>
          <div aria-hidden="true" style={{ position: "absolute", left: "0", right: "0", top: "33%", height: "12px", background: "linear-gradient(180deg, rgba(57,52,47,0), rgba(57,52,47,.055), rgba(57,52,47,0))" }}></div>
          <div aria-hidden="true" style={{ position: "absolute", left: "0", right: "0", top: "66%", height: "12px", background: "linear-gradient(180deg, rgba(57,52,47,0), rgba(57,52,47,.055), rgba(57,52,47,0))" }}></div>
          <div style={{ position: "absolute", right: "-8px", top: "-36px", width: "96px", background: "#FFFFFF", padding: "5px 5px 0", boxSizing: "border-box", transform: "rotate(7deg)", boxShadow: "0 14px 22px -10px rgba(0,0,0,.55)", zIndex: "2" }}>
            <div aria-hidden="true" style={{ position: "absolute", left: "22px", top: "-8px", width: "50px", height: "16px", background: "rgba(82,91,80,.32)", transform: "rotate(-5deg)" }}></div>
            <img src={asset('writer.jpg')} alt={t('c05.013')} style={{ display: "block", width: "100%", aspectRatio: "4 / 5", objectFit: "cover", objectPosition: "50% 15%", filter: "sepia(.15)" }} />
            <p style={{ margin: "0", padding: "3px 1px 5px", fontFamily: "'Patrick Hand', cursive", fontSize: "13px", color: "#525B50" }}>
              {t('c05.014')}
            </p>
          </div>
          <div style={{ fontFamily: "'Patrick Hand', cursive", fontSize: "18px", lineHeight: "1.6", color: "#39342F" }}>
            <p className="rv" style={{ margin: "0", fontFamily: "'Dancing Script', cursive", fontSize: "32px", lineHeight: "1.2" }}>
              {t('c05.009')}
            </p>
            <p className="rv" style={{ margin: "14px 0 0" }}>
              {t('c05.015')}
            </p>
            <p className="rv" style={{ margin: "14px 0 0" }}>
              {t('c05.016')}
            </p>
            <p className="rv" style={{ margin: "14px 0 0" }}>
              {t('c05.017')}
            </p>
            <p className="rv" style={{ margin: "14px 0 0" }}>
              {t('c05.018')}
            </p>
            <p className="rv" style={{ margin: "14px 0 0" }}>
              {t('c05.019')}
            </p>
            <div className="rv" style={{ margin: "20px 0 0" }}>
              <p style={{ margin: "0", fontSize: "21px" }}>
                <span className="hl">
                  {t('c05.020')}
                </span>
              </p>
              <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", gap: "4px", margin: "2px 0 0 18px", fontSize: "16px", color: "#9B7663", transform: "rotate(-2deg)" }}>
                <svg width="20" height="18" viewBox="0 0 26 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 20 C 12 18, 6 12, 5 3" />
                  <path d="M1 7l4-5 4 5" />
                </svg>
                {t('c05.021')}
              </span>
            </div>
            <p className="rv" style={{ margin: "14px 0 0" }}>
              {t('c05.022')}
            </p>
            <p className="rv" style={{ margin: "14px 0 0" }}>
              {t('c05.023')}
            </p>
            <p className="rv" style={{ margin: "14px 0 0" }}>
              {t('c05.024')}
            </p>
            <p className="rv" style={{ margin: "14px 0 0" }}>
              {t('c05.025')}
            </p>
            <p className="rv" style={{ margin: "14px 0 0" }}>
              {t('c05.026')}
            </p>
            <p className="rv" style={{ margin: "14px 0 0" }}>
              {t('c05.027')}
            </p>
            <div className="rv" style={{ margin: "20px 0 0" }}>
              <p style={{ margin: "0", fontSize: "21px" }}>
                <span className="hl">
                  {t('c05.028')}
                </span>
              </p>
              <span aria-hidden="true" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "4px", margin: "2px 6px 0 0", fontSize: "16px", color: "#9B7663", transform: "rotate(1.5deg)" }}>
                {t('c05.029')}
                <svg width="20" height="18" viewBox="0 0 26 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 20 C 14 18, 20 12, 21 3" />
                  <path d="M17 7l4-5 4 5" />
                </svg>
              </span>
            </div>
            <p className="rv" style={{ margin: "14px 0 0" }}>
              {t('c05.030')}
            </p>
            <p className="rv" style={{ margin: "20px 0 0", fontSize: "21px", color: "#525B50" }}>
              {t('c05.031')}
            </p>
            <div className="rv" style={{ marginTop: "26px", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span>
                {t('c05.032')}
              </span>
              <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: "44px", lineHeight: "1.1", transform: "rotate(-3deg)", marginTop: "4px" }}>
                {t('c05.033')}
              </span>
              <svg aria-hidden="true" width="130" height="16" viewBox="0 0 170 20" fill="none" stroke="#9B7663" strokeWidth="1.6" strokeLinecap="round">
                <path d="M4 12 C 40 4, 70 18, 104 9 S 150 6, 166 12" />
              </svg>
            </div>
          </div>
        </article>
        <div className="ps" style={{ position: "relative", zIndex: "2", width: "88%", margin: "-44px 0 0 auto", transform: "rotate(-2.5deg)", background: "#E6D8C5", color: "#39342F", padding: "20px 18px 16px", boxSizing: "border-box", textAlign: "left", boxShadow: "0 2px 3px rgba(57,52,47,.15), 0 20px 34px -18px rgba(0,0,0,.6)" }}>
          <div aria-hidden="true" style={{ position: "absolute", left: "50%", top: "-10px", width: "80px", height: "20px", marginLeft: "-40px", background: "rgba(250,247,240,.6)", transform: "rotate(4deg)" }}></div>
          <div style={{ fontFamily: "'Patrick Hand', cursive", fontSize: "17px", lineHeight: "1.5" }}>
            <span style={{ fontFamily: "'Dancing Script', cursive", fontWeight: "700", fontSize: "22px", color: "#9B7663" }}>
              {t('c05.034')}
            </span>
            {' '}{t('c05.035')}
          </div>
          <div aria-hidden="true" style={{ marginTop: "8px", display: "flex", gap: "4px", justifyContent: "flex-end", alignItems: "center", color: "#9B7663" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
              <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />
            </svg>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
              <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />
            </svg>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
              <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />
            </svg>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
              <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />
            </svg>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeDasharray="2 2.5">
              <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />
            </svg>
            <span style={{ fontFamily: "'Patrick Hand', cursive", fontSize: "13px", marginLeft: "4px" }}>
              {t('c05.036')}
            </span>
          </div>
        </div>
        <div style={{ position: "relative", marginTop: "30px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: "'Patrick Hand', cursive", fontSize: "19px", color: "#CDBBA3" }}>
            {t('c05.037')}
          </span>
          <button type="button" onClick={next} style={{ minHeight: "48px", padding: "0 22px", background: "#FAF7F0", color: "#39342F", border: "0", borderRadius: "2px", fontSize: "11px", letterSpacing: ".2em", cursor: "pointer" }}>
            {t('c05.038')}
          </button>
          <button type="button" onClick={foldBack} style={{ minHeight: "44px", padding: "0 18px", background: "transparent", color: "#CDBBA3", border: "0", fontSize: "11px", letterSpacing: ".18em", cursor: "pointer" }}>
            {t('c05.039')}
          </button>
        </div>
        </>
      )}
    </div>
  )
}
