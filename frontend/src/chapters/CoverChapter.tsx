import type { CSSProperties } from 'react'
import { useStory } from '../story/StoryContext'
import type { ChapterProps } from './types'

export default function CoverChapter({ turn, coverOpen, openCover }: ChapterProps) {
  const { t, asset } = useStory()
  return (
    <div className={`pg ${turn}`} style={{ position: "absolute", inset: "0", overflowY: "auto", background: "#F3EBDD", padding: "96px 24px 40px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div aria-hidden="true" style={{ position: "absolute", left: "34px", top: "110px", width: "300px", height: "420px", background: "#E6D8C5", transform: "rotate(-3deg)" }}></div>
      <div style={{ position: "relative", width: "300px", height: "408px", perspective: "1800px" }}>
        <div style={{ position: "absolute", inset: "0", background: "#FAF7F0", backgroundImage: "repeating-linear-gradient(180deg, transparent 0 27px, rgba(155,118,99,.2) 27px 28px)", borderRadius: "2px 6px 6px 2px", padding: "44px 30px 26px", boxSizing: "border-box", display: "flex", flexDirection: "column", boxShadow: "0 24px 44px -22px rgba(57,52,47,.45)" }}>
          <p style={{ margin: "-14px 0 0", fontFamily: "'Dancing Script', cursive", fontSize: "34px", lineHeight: "56px", color: "#39342F" }}>
            {t('c01.001')}
          </p>
          <p style={{ margin: "28px 0 0", fontFamily: "'Patrick Hand', cursive", fontSize: "22px", lineHeight: "28px", color: "#525B50" }}>
            {t('c01.002')}
          </p>
          <p style={{ margin: "0", fontFamily: "'Patrick Hand', cursive", fontSize: "19px", lineHeight: "28px", color: "#525B50" }}>
            {t('c01.003')}
          </p>
          <p style={{ margin: "28px 0 0", textAlign: "right", fontFamily: "'Dancing Script', cursive", fontSize: "26px", lineHeight: "28px", color: "#9B7663" }}>
            {t('c01.004')}
          </p>
        </div>
        <div style={{ position: "absolute", inset: "0", transformOrigin: "left center", transformStyle: "preserve-3d", transition: "transform 1.5s cubic-bezier(.6,.05,.2,1)", transform: coverOpen ? 'rotateY(-162deg)' : 'rotateY(0deg)', zIndex: "2" }}>
          <div style={{ position: "absolute", inset: "0", backfaceVisibility: "hidden", background: "#525B50", backgroundImage: "repeating-linear-gradient(90deg, rgba(250,247,240,.035) 0 2px, transparent 2px 5px)", borderRadius: "2px 6px 6px 2px", boxShadow: "inset 5px 0 0 rgba(57,52,47,.35), 0 26px 50px -24px rgba(57,52,47,.6)", padding: "22px 24px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "100%", display: "flex", justifyContent: "space-between", fontSize: "9px", letterSpacing: ".24em", color: "#E6D8C5" }}>
              <span>
                {t('c01.005')}
              </span>
              <span>
                {t('c01.006')}
              </span>
            </div>
            <div className="drop" style={{ '--r': "-2.5deg", position: "relative", marginTop: "18px", width: "200px", background: "#FAF7F0", padding: "8px 8px 0", boxSizing: "border-box", transform: "rotate(-2.5deg)", boxShadow: "0 14px 26px -12px rgba(0,0,0,.5)" } as CSSProperties}>
              <div aria-hidden="true" style={{ position: "absolute", left: "50%", top: "-10px", width: "70px", height: "20px", marginLeft: "-35px", background: "rgba(199,143,145,.6)" }}></div>
              <img src={asset('balcony.jpg')} alt={t('c01.007')} style={{ display: "block", width: "100%", aspectRatio: "1 / .86", objectFit: "cover", objectPosition: "50% 38%", filter: "sepia(.12)" }} />
              <p className="inkx" style={{ margin: "0", padding: "6px 2px 10px", fontFamily: "Caveat, cursive", fontSize: "17px", color: "#525B50" }}>
                {t('c01.008')}
              </p>
            </div>
            <h1 style={{ margin: "18px 0 0", fontFamily: "'Cormorant Garamond', serif", fontWeight: "500", fontSize: "38px", lineHeight: "1", color: "#FAF7F0" }}>
              {t('c01.009')}
            </h1>
            <p style={{ margin: "8px 0 0", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "16px", color: "#E6D8C5" }}>
              {t('c01.010')}
            </p>
          </div>
          <div aria-hidden="true" style={{ position: "absolute", inset: "0", backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "#4A5248", borderRadius: "6px 2px 2px 6px" }}></div>
        </div>
      </div>
      {!coverOpen && (
        <>
        <button className="btn tap" type="button" onClick={openCover} style={{ position: "relative", marginTop: "36px", minHeight: "50px", padding: "0 30px", background: "#39342F", color: "#FAF7F0", border: "0", borderRadius: "2px", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: ".2em", cursor: "pointer" }}>
          {t('c01.011')}
        </button>
        <span style={{ position: "relative", marginTop: "10px", fontSize: "12px", color: "#6B6158" }}>
          {t('c01.012')}
        </span>
        </>
      )}
      {coverOpen && (
        <>
        <div className="fade" style={{ position: "relative", marginTop: "36px", display: "flex", alignItems: "center", gap: "10px", fontFamily: "'Patrick Hand', cursive", fontSize: "21px", color: "#9B7663" }}>
          {t('c01.013')}
          <span className="nudge" style={{ display: "inline-flex" }}>
            <svg aria-hidden="true" width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 7h22M18 2l5 5-5 5" />
            </svg>
          </span>
        </div>
        </>
      )}
    </div>
  )
}
