import type { CSSProperties } from 'react'
import { useStory } from '../story/StoryContext'
import type { ChapterProps } from './types'

export default function MatchChapter({ turn, next }: ChapterProps) {
  const { t, asset } = useStory()
  return (
    <div className={`pg ${turn}`} style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", background: "#F3EBDD", padding: "92px 20px 50px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "8px" }}>
        <span style={{ fontSize: "10px", letterSpacing: ".3em", color: "#525B50" }}>
          {t('c02.001')}
        </span>
        <h2 style={{ margin: "0", fontFamily: "'Cormorant Garamond', serif", fontWeight: "500", fontSize: "33px", lineHeight: "1.08", letterSpacing: ".03em" }}>
          {t('c02.002')}
        </h2>
        <p style={{ margin: "0", fontFamily: "'Patrick Hand', cursive", fontSize: "18px", lineHeight: "1.35", color: "#9B7663" }}>
          {t('c02.003')}
        </p>
      </div>
      <div style={{ position: "relative", height: "330px", marginTop: "30px" }}>
        <div aria-hidden="true" style={{ position: "absolute", left: "14px", top: "26px", right: "14px", height: "260px", background: "#E6D8C5", transform: "rotate(-2deg)" }}></div>
        <figure className="drop" style={{ '--r': "-5deg", position: "absolute", left: "0", top: "0", width: "176px", margin: "0", background: "#FAF7F0", padding: "8px 8px 0", boxSizing: "border-box", transform: "rotate(-5deg)", boxShadow: "0 18px 30px -14px rgba(57,52,47,.55)", zIndex: "2" } as CSSProperties}>
          <div aria-hidden="true" style={{ position: "absolute", left: "50%", top: "-10px", width: "70px", height: "20px", marginLeft: "-35px", background: "rgba(82,91,80,.38)", transform: "rotate(-4deg)" }}></div>
          <img src={asset('profile-1.jpg')} alt={t('c02.004')} style={{ display: "block", width: "100%", aspectRatio: "4 / 5", objectFit: "cover", objectPosition: "50% 18%" }} />
          <figcaption style={{ padding: "6px 2px 10px", fontFamily: "'Dancing Script', cursive", fontSize: "21px" }}>
            {t('c02.005')}
          </figcaption>
        </figure>
        <figure className="drop" style={{ '--r': "4deg", position: "absolute", right: "0", top: "40px", width: "176px", margin: "0", background: "#FAF7F0", padding: "8px 8px 0", boxSizing: "border-box", transform: "rotate(4deg)", boxShadow: "0 18px 30px -14px rgba(57,52,47,.55)", zIndex: "3", animationDelay: ".55s" } as CSSProperties}>
          <svg aria-hidden="true" width="18" height="44" viewBox="0 0 26 62" fill="none" stroke="#8A8378" strokeWidth="2.4" strokeLinecap="round" style={{ position: "absolute", right: "24px", top: "-16px" }}>
            <path d="M8 50V12a6 6 0 0 1 12 0v40a9 9 0 0 1-18 0V18" />
          </svg>
          <img src={asset('profile-2.jpg')} alt={t('c02.006')} style={{ display: "block", width: "100%", aspectRatio: "4 / 5", objectFit: "cover", objectPosition: "50% 30%" }} />
          <figcaption style={{ padding: "6px 2px 10px", fontFamily: "'Dancing Script', cursive", fontSize: "21px" }}>
            {t('c02.007')}
          </figcaption>
        </figure>
      </div>
      <p className="m2rv" style={{ '--r': "-2deg", margin: "6px 0 0 8px", display: "inline-block", background: "#FAF7F0", padding: "8px 14px", fontFamily: "'Patrick Hand', cursive", fontSize: "19px", color: "#525B50", transform: "rotate(-2deg)", boxShadow: "0 10px 18px -12px rgba(57,52,47,.4)" } as CSSProperties}>
        {t('c02.008')}
      </p>
      <div style={{ position: "relative", height: "210px", marginTop: "54px" }}>
        <div aria-hidden="true" style={{ position: "absolute", left: "30px", right: "30px", top: "14px", height: "180px", background: "#E6D8C5", transform: "rotate(1.5deg)" }}></div>
        <div className="m2L" style={{ position: "absolute", left: "34px", top: "22px", width: "118px", background: "#FAF7F0", padding: "6px 6px 22px", boxSizing: "border-box", transform: "rotate(-5deg)", boxShadow: "0 14px 24px -12px rgba(57,52,47,.5)", zIndex: "2" }}>
          <img src={asset('profile-1.jpg')} alt="" style={{ display: "block", width: "100%", aspectRatio: "1 / 1", objectFit: "cover", objectPosition: "55% 30%" }} />
        </div>
        <div className="m2R" style={{ position: "absolute", right: "34px", top: "30px", width: "118px", background: "#FAF7F0", padding: "6px 6px 22px", boxSizing: "border-box", transform: "rotate(5deg)", boxShadow: "0 14px 24px -12px rgba(57,52,47,.5)", zIndex: "2" }}>
          <img src={asset('profile-2.jpg')} alt="" style={{ display: "block", width: "100%", aspectRatio: "1 / 1", objectFit: "cover", objectPosition: "50% 38%" }} />
        </div>
        <div className="m2stp" role="img" aria-label={t('c02.009')} style={{ position: "absolute", left: "50%", top: "70px", width: "190px", marginLeft: "-95px", zIndex: "4", transform: "rotate(-8deg)", opacity: ".92" }}>
          <div className="ink-stamp" style={{ border: "3px solid #A8655A", outline: "1.5px solid #A8655A", outlineOffset: "3px", padding: "8px 6px 7px", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", color: "#A8655A", background: "rgba(243,235,221,.6)" }}>
            <span aria-hidden="true" style={{ fontSize: "8px", letterSpacing: ".5em" }}>
              ★ ★ ★
            </span>
            <span style={{ fontFamily: "Inter, sans-serif", fontWeight: "800", fontSize: "24px", letterSpacing: ".05em", lineHeight: "1" }}>
              {t('c02.010')}
            </span>
          </div>
        </div>
      </div>
      <p className="m2rv" style={{ margin: "12px 0 0", textAlign: "center", fontFamily: "'Patrick Hand', cursive", fontSize: "24px" }}>
        {t('c02.011')}
      </p>
      <div style={{ marginTop: "50px", display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
        <div style={{ position: "relative", display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center", padding: "22px 18px", background: "#E6D8C5", transform: "rotate(-1deg)" }}>
          <span className="m2rv" style={{ '--r': "-4deg", display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px 8px 9px", background: "#FAF7F0", borderRadius: "999px", boxShadow: "0 0 0 4px #FFFFFF, 0 10px 18px -10px rgba(57,52,47,.45)", transform: "rotate(-4deg)" } as CSSProperties}>
            <span style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#F3EBDD", display: "flex", alignItems: "center", justifyContent: "center", color: "#525B50" }}>
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 13 L6 4 L12 9 Q16 8 20 9 L26 4 L26 13 Q28 17 26 22 Q22 28 16 28 Q10 28 6 22 Q4 17 6 13 Z" />
                <path d="M12 16h.01M20 16h.01" />
                <path d="M14.5 20 L16 21.2 L17.5 20" />
              </svg>
            </span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "21px", fontWeight: "500" }}>
              {t('c02.012')}
            </span>
          </span>
          <span className="m2rv" style={{ '--r': "3deg", display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px 8px 9px", background: "#FAF7F0", borderRadius: "999px", boxShadow: "0 0 0 4px #FFFFFF, 0 10px 18px -10px rgba(57,52,47,.45)", transform: "rotate(3deg)" } as CSSProperties}>
            <span style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#F3EBDD", display: "flex", alignItems: "center", justifyContent: "center", color: "#525B50" }}>
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12 L16 6 L30 12 L16 18 Z" />
                <path d="M8 15v6c0 2.5 3.6 4 8 4s8-1.5 8-4v-6" />
                <path d="M28 13v8" />
              </svg>
            </span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "21px", fontWeight: "500" }}>
              {t('c02.013')}
            </span>
          </span>
        </div>
        <p className="m2rv" style={{ margin: "0", textAlign: "center", fontFamily: "'Patrick Hand', cursive", fontSize: "20px", color: "#525B50" }}>
          {t('c02.014')}
        </p>
      </div>
      <div style={{ position: "relative", marginTop: "56px", background: "#FAF7F0", padding: "54px 14px 26px", boxSizing: "border-box", transform: "rotate(-.5deg)", boxShadow: "0 30px 50px -28px rgba(57,52,47,.5)" }}>
        <div aria-hidden="true" style={{ position: "absolute", left: "50%", top: "-11px", width: "100px", height: "22px", marginLeft: "-50px", background: "rgba(199,143,145,.55)", transform: "rotate(-3deg)" }}></div>
        <div style={{ position: "absolute", left: "50%", top: "14px", transform: "translateX(-50%) rotate(-2deg)", padding: "4px 12px", border: "1.5px solid #9B7663", color: "#9B7663", fontSize: "11px", letterSpacing: ".28em", fontWeight: "500" }}>
          08.11.2026
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14.5px", lineHeight: "1.45" }}>
          <div className="m2L2" style={{ display: "flex", alignItems: "flex-end", gap: "8px", alignSelf: "flex-start", maxWidth: "84%" }}>
            <img src={asset('profile-2.jpg')} alt="" style={{ width: "28px", height: "28px", flex: "0 0 auto", borderRadius: "50%", objectFit: "cover", objectPosition: "50% 30%", border: "2px solid #FFFFFF" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontFamily: "'Patrick Hand', cursive", fontSize: "13px", color: "#6B6158" }}>
                {t('c02.015')}
              </span>
              <span style={{ padding: "9px 13px", background: "#E6D8C5", borderRadius: "15px 15px 15px 4px" }}>
                {t('c02.016')}
              </span>
            </div>
          </div>
          <p className="m2rv" style={{ '--r': "-2deg", margin: "0 0 4px 36px", fontFamily: "'Patrick Hand', cursive", fontSize: "17px", color: "#9B7663", transform: "rotate(-2deg)" } as CSSProperties}>
            {t('c02.017')}
          </p>
          <div className="m2R2" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px", alignSelf: "flex-end", maxWidth: "80%" }}>
            <span style={{ fontFamily: "'Patrick Hand', cursive", fontSize: "13px", color: "#6B6158" }}>
              {t('c02.018')}
            </span>
            <span style={{ padding: "9px 13px", background: "#525B50", color: "#FAF7F0", borderRadius: "15px 15px 4px 15px" }}>
              {t('c02.019')}
            </span>
          </div>
          <span className="m2R2" style={{ alignSelf: "flex-end", maxWidth: "80%", padding: "9px 13px", background: "#525B50", color: "#FAF7F0", borderRadius: "15px 15px 4px 15px" }}>
            {t('c02.020')}
          </span>
          <p className="m2rv" style={{ '--r': "1.5deg", alignSelf: "flex-end", maxWidth: "86%", margin: "0 4px 4px 0", textAlign: "right", fontFamily: "'Patrick Hand', cursive", fontSize: "16px", lineHeight: "1.3", color: "#525B50", transform: "rotate(1.5deg)" } as CSSProperties}>
            {t('c02.021')}
          </p>
          <span className="m2L2" style={{ alignSelf: "flex-start", maxWidth: "80%", marginLeft: "36px", padding: "9px 13px", background: "#E6D8C5", borderRadius: "15px 15px 15px 4px" }}>
            {t('c02.022')}
          </span>
          <span className="m2R2" style={{ alignSelf: "flex-end", maxWidth: "80%", padding: "9px 13px", background: "#525B50", color: "#FAF7F0", borderRadius: "15px 15px 4px 15px" }}>
            {t('c02.023')}
          </span>
          <span className="m2L2" style={{ alignSelf: "flex-start", maxWidth: "80%", marginLeft: "36px", padding: "9px 13px", background: "#E6D8C5", borderRadius: "15px 15px 15px 4px" }}>
            {t('c02.024')}
          </span>
          <span className="m2R2" style={{ alignSelf: "flex-end", maxWidth: "80%", padding: "9px 13px", background: "#525B50", color: "#FAF7F0", borderRadius: "15px 15px 4px 15px" }}>
            {t('c02.025')}
          </span>
          <span className="m2R2" style={{ alignSelf: "flex-end", maxWidth: "80%", padding: "9px 13px", background: "#525B50", color: "#FAF7F0", borderRadius: "15px 15px 4px 15px" }}>
            {t('c02.026')}
          </span>
          <span className="m2L2" style={{ alignSelf: "flex-start", maxWidth: "80%", marginLeft: "36px", padding: "9px 13px", background: "#E6D8C5", borderRadius: "15px 15px 15px 4px" }}>
            {t('c02.027')}
          </span>
          <span className="m2R2" style={{ alignSelf: "flex-end", maxWidth: "80%", padding: "9px 13px", background: "#525B50", color: "#FAF7F0", borderRadius: "15px 15px 4px 15px" }}>
            {t('c02.028')}
          </span>
        </div>
      </div>
      <div className="m2rv" style={{ '--r': "1deg", position: "relative", margin: "60px 6px 0", background: "#FAF7F0", padding: "30px 24px 26px", boxSizing: "border-box", transform: "rotate(1deg)", boxShadow: "0 24px 40px -22px rgba(57,52,47,.45)" } as CSSProperties}>
        <div aria-hidden="true" style={{ position: "absolute", left: "22px", top: "-10px", width: "70px", height: "20px", background: "rgba(82,91,80,.32)", transform: "rotate(-5deg)" }}></div>
        <p style={{ margin: "0", fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", lineHeight: "1.5" }}>
          {t('c02.029')}
        </p>
        <p style={{ margin: "12px 0 0", fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", lineHeight: "1.5" }}>
          {t('c02.030')}
        </p>
        <p style={{ margin: "20px 0 0", fontFamily: "'Dancing Script', cursive", fontSize: "28px", lineHeight: "1.25", color: "#9B7663" }}>
          {t('c02.031')}
        </p>
      </div>
      <div style={{ marginTop: "34px", display: "flex", justifyContent: "center" }}>
        <button type="button" onClick={next} style={{ minHeight: "48px", padding: "0 6px", background: "transparent", border: "0", borderBottom: "1px solid #9B7663", color: "#39342F", fontFamily: "'Patrick Hand', cursive", fontSize: "21px", cursor: "pointer" }}>
          {t('c02.032')}
        </button>
      </div>
    </div>
  )
}
