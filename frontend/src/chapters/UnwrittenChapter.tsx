import type { CSSProperties } from 'react'
import { useStory } from '../story/StoryContext'
import type { ChapterProps } from './types'

export default function UnwrittenChapter({ turn, go, unwrittenOpen: envOpen, openUnwritten }: ChapterProps) {
  const { t, asset } = useStory()
  return (
    <div className={`pg ${turn}`} style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", background: "#F3EBDD", padding: "92px 20px 50px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "6px" }}>
        <span style={{ fontSize: "10px", letterSpacing: ".3em", color: "#525B50" }}>
          {t('c06.001')}
        </span>
        <h2 style={{ margin: "0", fontFamily: "'Cormorant Garamond', serif", fontWeight: "500", fontSize: "36px", lineHeight: "1.05" }}>
          {t('c06.002')}{' '}
          <em style={{ fontWeight: "400", color: "#9B7663" }}>
            {t('c06.003')}
          </em>
        </h2>
        <p style={{ margin: "2px 0 0", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "19px", color: "#525B50" }}>
          {t('c06.004')}
        </p>
      </div>
      <p className="m2rv" style={{ '--r': "-3deg", margin: "30px 0 14px 4px", fontFamily: "'Patrick Hand', cursive", fontSize: "19px", color: "#9B7663", transform: "rotate(-3deg)" } as CSSProperties}>
        {t('c06.005')}
      </p>
      <div style={{ position: "relative", width: "262px", marginLeft: "4px", transform: "rotate(-1.5deg)", background: "#2E2A26", display: "flex", gap: "8px", padding: "14px 8px", boxSizing: "border-box", boxShadow: "0 30px 50px -24px rgba(57,52,47,.7)" }}>
        <div aria-hidden="true" style={{ width: "12px", flex: "0 0 auto", backgroundImage: "repeating-linear-gradient(180deg, transparent 0 10px, #E6D8C5 10px 20px, transparent 20px 28px)" }}></div>
        <ol style={{ listStyle: "none", margin: "0", padding: "0", flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "22px" }}>
          <li style={{ position: "relative", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div className="m6dev" style={{ position: "relative", aspectRatio: "4 / 3", background: "#1E1B18", display: "flex", overflow: "hidden", borderRadius: "3px" }}>
              <img src={asset('profile-1.jpg')} alt={t('c06.006')} style={{ flex: "1", minWidth: "0", height: "100%", objectFit: "cover", objectPosition: "55% 25%" }} />
              <img src={asset('profile-2.jpg')} alt={t('c06.007')} style={{ flex: "1", minWidth: "0", height: "100%", objectFit: "cover", objectPosition: "50% 32%" }} />
              <span style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%) rotate(-8deg)", padding: "3px 8px", border: "2px solid #E6D8C5", color: "#F3EBDD", background: "rgba(46,42,38,.35)", fontWeight: "700", fontSize: "11px", letterSpacing: ".08em", whiteSpace: "nowrap" }}>
                {t('c06.008')}
              </span>
            </div>
            <span style={{ fontSize: "9px", letterSpacing: ".2em", color: "#E6D8C5" }}>
              {t('c06.009')}
            </span>
            <span className="m2rv" style={{ '--r': "-3deg", position: "absolute", right: "-96px", bottom: "30px", width: "120px", padding: "8px 10px", background: "#FAF7F0", fontFamily: "'Patrick Hand', cursive", fontSize: "15px", lineHeight: "1.25", color: "#525B50", transform: "rotate(-3deg)", boxShadow: "0 10px 18px -10px rgba(0,0,0,.5)", zIndex: "2" } as CSSProperties}>
              {t('c06.010')}
            </span>
          </li>
          <li style={{ position: "relative", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div className="m6dev" style={{ aspectRatio: "4 / 3", background: "#FAF7F0", borderRadius: "3px", padding: "10px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "5px", fontSize: "11px", lineHeight: "1.3", overflow: "hidden" }}>
              <span style={{ alignSelf: "center", fontSize: "8px", letterSpacing: ".24em", color: "#9B7663" }}>
                08.11.2026
              </span>
              <span style={{ alignSelf: "flex-start", padding: "4px 8px", background: "#E6D8C5", borderRadius: "10px 10px 10px 3px" }}>
                {t('c06.011')}
              </span>
              <span style={{ alignSelf: "flex-end", padding: "4px 8px", background: "#525B50", color: "#FAF7F0", borderRadius: "10px 10px 3px 10px" }}>
                {t('c06.012')}
              </span>
              <span style={{ alignSelf: "flex-end", padding: "4px 8px", background: "#525B50", color: "#FAF7F0", borderRadius: "10px 3px 3px 10px" }}>
                {t('c06.013')}
              </span>
            </div>
            <span style={{ fontSize: "9px", letterSpacing: ".2em", color: "#E6D8C5" }}>
              {t('c06.014')}
            </span>
            <span className="m2rv" style={{ '--r': "3deg", position: "absolute", right: "-96px", bottom: "30px", width: "120px", padding: "8px 10px", background: "#FAF7F0", fontFamily: "'Patrick Hand', cursive", fontSize: "15px", lineHeight: "1.25", color: "#525B50", transform: "rotate(3deg)", boxShadow: "0 10px 18px -10px rgba(0,0,0,.5)", zIndex: "2" } as CSSProperties}>
              {t('c06.015')}
            </span>
          </li>
          <li style={{ position: "relative", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div className="m6glow" style={{ aspectRatio: "4 / 3", borderRadius: "3px", border: "1.5px dashed rgba(230,216,197,.6)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(250,247,240,.04)" }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "20px", color: "rgba(243,235,221,.78)" }}>
                {t('c06.016')}
              </span>
            </div>
            <span style={{ fontSize: "9px", letterSpacing: ".2em", color: "#E6D8C5" }}>
              {t('c06.017')}
            </span>
            <span className="m2rv" style={{ '--r': "-2deg", position: "absolute", right: "-96px", bottom: "30px", width: "120px", padding: "8px 10px", background: "#FAF7F0", fontFamily: "'Patrick Hand', cursive", fontSize: "15px", lineHeight: "1.25", color: "#9B7663", transform: "rotate(-2deg)", boxShadow: "0 10px 18px -10px rgba(0,0,0,.5)", zIndex: "2" } as CSSProperties}>
              {t('c06.018')}
            </span>
          </li>
          <li style={{ position: "relative", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div className="m6glow" style={{ aspectRatio: "4 / 3", borderRadius: "3px", border: "1.5px dashed rgba(230,216,197,.6)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(250,247,240,.04)", animationDelay: "1.6s" }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "20px", color: "rgba(243,235,221,.78)" }}>
                {t('c06.019')}
              </span>
            </div>
            <span style={{ fontSize: "9px", letterSpacing: ".2em", color: "#E6D8C5" }}>
              {t('c06.020')}
            </span>
            <span className="m2rv" style={{ '--r': "3deg", position: "absolute", right: "-96px", bottom: "30px", width: "120px", padding: "8px 10px", background: "#FAF7F0", fontFamily: "'Patrick Hand', cursive", fontSize: "15px", lineHeight: "1.25", color: "#9B7663", transform: "rotate(3deg)", boxShadow: "0 10px 18px -10px rgba(0,0,0,.5)", zIndex: "2" } as CSSProperties}>
              {t('c06.021')}
            </span>
          </li>
        </ol>
        <div aria-hidden="true" style={{ width: "12px", flex: "0 0 auto", backgroundImage: "repeating-linear-gradient(180deg, transparent 0 10px, #E6D8C5 10px 20px, transparent 20px 28px)" }}></div>
      </div>
      <div style={{ marginTop: "50px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {!envOpen && (
          <>
          <button className="tap" type="button" onClick={openUnwritten} aria-label={t('c06.022')} style={{ position: "relative", width: "300px", height: "190px", padding: "0", border: "0", background: "transparent", cursor: "pointer" }}>
            <span aria-hidden="true" style={{ position: "absolute", inset: "0", background: "#E6D8C5", boxShadow: "0 30px 46px -24px rgba(57,52,47,.55)" }}></span>
            <span aria-hidden="true" style={{ position: "absolute", inset: "0", background: "#DDCBB3", clipPath: "polygon(0 100%, 50% 48%, 100% 100%)" }}></span>
            <span aria-hidden="true" style={{ position: "absolute", left: "0", right: "0", top: "0", height: "58%", background: "#D5C1A6", clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}></span>
            <span aria-hidden="true" className="pulse" style={{ position: "absolute", left: "50%", top: "56%", width: "56px", height: "56px", margin: "-28px 0 0 -28px", borderRadius: "50%", background: "#9B7663", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Dancing Script', cursive", fontSize: "26px", color: "#F3EBDD" }}>
              {t('c06.023')}
            </span>
            <span aria-hidden="true" style={{ position: "absolute", left: "7%", bottom: "9%", fontFamily: "'Dancing Script', cursive", fontSize: "24px", color: "#39342F" }}>
              {t('c06.024')}
            </span>
          </button>
          <span style={{ marginTop: "14px", fontFamily: "'Patrick Hand', cursive", fontSize: "18px", color: "#9B7663" }}>
            {t('c06.025')}
          </span>
          </>
        )}
        {envOpen && (
          <>
          <article className="unfold" aria-label={t('c06.026')} style={{ position: "relative", width: "100%", background: "#FAF7F0", backgroundImage: "repeating-linear-gradient(180deg, transparent 0 31px, rgba(155,118,99,.16) 31px 32px)", padding: "34px 20px 30px 34px", boxSizing: "border-box", boxShadow: "0 34px 54px -28px rgba(57,52,47,.55)" }}>
            <div aria-hidden="true" style={{ position: "absolute", left: "22px", top: "0", bottom: "0", width: "1px", background: "rgba(199,143,145,.55)" }}></div>
            <div aria-hidden="true" style={{ position: "absolute", left: "50%", top: "-10px", width: "80px", height: "20px", marginLeft: "-40px", background: "rgba(82,91,80,.32)", transform: "rotate(-3deg)" }}></div>
            <div style={{ fontFamily: "'Patrick Hand', cursive", fontSize: "18px", lineHeight: "32px" }}>
              <p style={{ margin: "0", fontFamily: "'Dancing Script', cursive", fontSize: "28px", lineHeight: "32px" }}>
                {t('c06.027')}
              </p>
              <p style={{ margin: "32px 0 0" }}>
                {t('c06.028')}
              </p>
              <p style={{ margin: "32px 0 0" }}>
                {t('c06.029')}
              </p>
              <p style={{ margin: "32px 0 0" }}>
                {t('c06.030')}
              </p>
              <p style={{ margin: "32px 0 0" }}>
                {t('c06.031')}
              </p>
              <p style={{ margin: "32px 0 0", textAlign: "right", fontFamily: "'Dancing Script', cursive", fontSize: "26px", color: "#9B7663" }}>
                {t('c06.032')}
              </p>
            </div>
          </article>
          </>
        )}
      </div>
      <div style={{ marginTop: "70px", display: "flex", flexDirection: "column", alignItems: "center", gap: "26px", textAlign: "center" }}>
        <p className="m2rv" style={{ margin: "0", fontFamily: "'Patrick Hand', cursive", fontSize: "26px", lineHeight: "1.35" }}>
          {t('c06.033')}
        </p>
        <div style={{ position: "relative", width: "300px", height: "212px" }}>
          <div className="m6morph" style={{ position: "relative", width: "100%", height: "100%", boxSizing: "border-box", background: "#FAF7F0", border: "1.5px solid #CDBBA3", padding: "9px", transform: "rotate(-.6deg)", boxShadow: "0 26px 44px -24px rgba(57,52,47,.55)" }}>
            <div className="m6morphIn" style={{ width: "100%", height: "100%", boxSizing: "border-box", border: "1px solid #E6D8C5" }}></div>
            <span className="m6morphLabel" aria-hidden="true" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "22px", color: "rgba(243,235,221,.85)", opacity: "0" }}>
              {t('c06.019')}
            </span>
          </div>
        </div>
        <span className="m2rv" style={{ fontFamily: "'Patrick Hand', cursive", fontSize: "17px", color: "#9B7663" }}>
          {t('c06.034')}
        </span>
        <button type="button" onClick={() => go(6)} style={{ minHeight: "48px", padding: "0 6px", background: "transparent", border: "0", borderBottom: "1px solid #9B7663", color: "#39342F", fontFamily: "'Patrick Hand', cursive", fontSize: "20px", cursor: "pointer" }}>
          {t('c06.035')}
        </button>
      </div>
    </div>
  )
}
