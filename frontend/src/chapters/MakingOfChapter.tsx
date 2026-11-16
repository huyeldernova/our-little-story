import type { CSSProperties } from 'react'
import { useStory } from '../story/StoryContext'
import type { ChapterProps } from './types'

export default function MakingOfChapter({ turn, next }: ChapterProps) {
  const { t, asset } = useStory()
  return (
    <div className={`pg ${turn}`} style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", background: "#F3EBDD", padding: "92px 20px 50px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "6px" }}>
        <span style={{ fontSize: "10px", letterSpacing: ".3em", color: "#525B50" }}>
          {t('c04.001')}
        </span>
        <h2 style={{ margin: "0", fontFamily: "'Cormorant Garamond', serif", fontWeight: "500", fontSize: "32px", lineHeight: "1.05", letterSpacing: ".04em" }}>
          {t('c04.002')}
          <br />
          <em style={{ fontWeight: "400", letterSpacing: "0", color: "#9B7663" }}>
            {t('c04.003')}
          </em>
        </h2>
        <p style={{ margin: "2px 0 0", fontFamily: "'Patrick Hand', cursive", fontSize: "18px", color: "#525B50" }}>
          {t('c04.004')}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginTop: "56px" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "34px", color: "#9B7663" }}>
          01
        </span>
        <span style={{ fontSize: "10px", letterSpacing: ".3em", color: "#525B50" }}>
          {t('c04.005')}
        </span>
      </div>
      <p className="m2rv" style={{ margin: "8px 0 0", fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", lineHeight: "1.3" }}>
        {t('c04.006')}
      </p>
      <div role="img" aria-label={t('c04.007')} style={{ position: "relative", margin: "22px -20px 0", height: "470px", background: "#E6D8C5", backgroundImage: "repeating-linear-gradient(90deg, rgba(155,118,99,.07) 0 2px, transparent 2px 18px)", boxShadow: "inset 0 0 80px rgba(57,52,47,.12)" }}>
        <div className="m3pol" style={{ '--r': "-4deg", position: "absolute", left: "24px", top: "28px", width: "230px", background: "#FAF7F0", backgroundImage: "repeating-linear-gradient(180deg, transparent 0 25px, rgba(155,118,99,.22) 25px 26px)", padding: "22px 16px 16px", boxSizing: "border-box", transform: "rotate(-4deg)", boxShadow: "0 20px 34px -18px rgba(57,52,47,.55)" } as CSSProperties}>
          <span style={{ display: "block", fontFamily: "'Patrick Hand', cursive", fontSize: "20px", lineHeight: "26px" }}>
            {t('c04.008')}
          </span>
          <span style={{ display: "block", fontFamily: "'Patrick Hand', cursive", fontSize: "17px", lineHeight: "26px", color: "#525B50" }}>
            {t('c04.009')}
          </span>
          <span style={{ display: "block", fontFamily: "'Patrick Hand', cursive", fontSize: "17px", lineHeight: "26px", color: "#525B50" }}>
            {t('c04.010')}
          </span>
          <span style={{ display: "block", fontFamily: "'Patrick Hand', cursive", fontSize: "17px", lineHeight: "26px", color: "#525B50" }}>
            {t('c04.011')}
          </span>
          <span style={{ display: "block", fontFamily: "'Patrick Hand', cursive", fontSize: "17px", lineHeight: "26px", color: "#525B50" }}>
            {t('c04.012')}
          </span>
          <span style={{ display: "block", fontFamily: "'Patrick Hand', cursive", fontSize: "17px", lineHeight: "26px", color: "#525B50" }}>
            {t('c04.013')}
          </span>
          <span style={{ display: "block", fontFamily: "'Patrick Hand', cursive", fontSize: "16px", lineHeight: "26px", color: "#9B7663" }}>
            {t('c04.014')}
          </span>
        </div>
        <div className="m3pol" style={{ '--r': "4deg", position: "absolute", right: "18px", top: "250px", width: "230px", transform: "rotate(4deg)" } as CSSProperties}>
          <div style={{ background: "#39342F", borderRadius: "8px 8px 3px 3px", padding: "8px 8px 10px", boxShadow: "0 20px 34px -16px rgba(57,52,47,.6)" }}>
            <img src={asset('shot-cover-closed.jpg')} alt="" style={{ display: "block", width: "100%", aspectRatio: "16 / 10", objectFit: "cover" }} />
          </div>
          <div style={{ height: "10px", margin: "0 -14px", background: "#6B6158", borderRadius: "0 0 8px 8px" }}></div>
        </div>
        <div aria-hidden="true" style={{ position: "absolute", left: "50px", bottom: "36px", width: "74px", height: "74px", borderRadius: "50%", background: "#FAF7F0", boxShadow: "0 12px 22px -10px rgba(57,52,47,.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#7A5A48", boxShadow: "inset 0 0 0 5px #9B7663" }}></span>
        </div>
        <div aria-hidden="true" style={{ position: "absolute", right: "30px", top: "70px", width: "120px", height: "8px", background: "#C9A15A", borderRadius: "2px", transform: "rotate(-50deg)" }}></div>
        <span style={{ position: "absolute", right: "12px", bottom: "8px", fontSize: "9px", letterSpacing: ".2em", color: "#6B6158" }}>
          {t('c04.015')}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginTop: "56px" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "34px", color: "#9B7663" }}>
          02
        </span>
        <span style={{ fontSize: "10px", letterSpacing: ".3em", color: "#525B50" }}>
          {t('c04.016')}
        </span>
      </div>
      <p className="m2rv" style={{ margin: "8px 0 0", fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", lineHeight: "1.3" }}>
        {t('c04.017')}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0", marginTop: "26px" }}>
        <figure className="m3pol" style={{ '--r': "-3deg", margin: "0 40px 0 0", background: "#FAF7F0", padding: "9px 9px 0", transform: "rotate(-3deg)", boxShadow: "0 18px 30px -16px rgba(57,52,47,.5)", position: "relative", zIndex: "1" } as CSSProperties}>
          <img src={asset('shot-cover-open.jpg')} alt={t('c04.018')} style={{ display: "block", width: "100%", aspectRatio: "16 / 10", objectFit: "cover", objectPosition: "0% 30%" }} />
          <figcaption style={{ padding: "7px 2px 10px", fontFamily: "'Patrick Hand', cursive", fontSize: "16px", color: "#525B50" }}>
            {t('c04.019')}
          </figcaption>
        </figure>
        <figure className="m3pol" style={{ '--r': "2.5deg", margin: "-18px 0 0 40px", background: "#FAF7F0", padding: "9px 9px 0", transform: "rotate(2.5deg)", boxShadow: "0 18px 30px -16px rgba(57,52,47,.5)", position: "relative", zIndex: "2" } as CSSProperties}>
          <img src={asset('shot-ch02.jpg')} alt={t('c04.020')} style={{ display: "block", width: "100%", aspectRatio: "16 / 12", objectFit: "cover", objectPosition: "50% 10%" }} />
          <figcaption style={{ padding: "7px 2px 10px", fontFamily: "'Patrick Hand', cursive", fontSize: "16px", color: "#525B50" }}>
            {t('c04.021')}
          </figcaption>
        </figure>
        <figure className="m3pol" style={{ '--r': "-2deg", margin: "-18px 30px 0 10px", background: "#FAF7F0", padding: "9px 9px 0", transform: "rotate(-2deg)", boxShadow: "0 18px 30px -16px rgba(57,52,47,.5)", position: "relative", zIndex: "3" } as CSSProperties}>
          <img src={asset('shot-ch03.jpg')} alt={t('c04.022')} style={{ display: "block", width: "100%", aspectRatio: "16 / 12", objectFit: "cover", objectPosition: "50% 0%" }} />
          <figcaption style={{ padding: "7px 2px 10px", fontFamily: "'Patrick Hand', cursive", fontSize: "16px", color: "#525B50" }}>
            {t('c04.023')}
          </figcaption>
        </figure>
        <span className="m2rv" style={{ '--r': "-5deg", alignSelf: "center", marginTop: "18px", padding: "5px 10px", border: "1.5px solid #A8655A", color: "#A8655A", fontSize: "10px", letterSpacing: ".22em", transform: "rotate(-5deg)" } as CSSProperties}>
          {t('c04.024')}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginTop: "56px" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "34px", color: "#9B7663" }}>
          03
        </span>
        <span style={{ fontSize: "10px", letterSpacing: ".3em", color: "#525B50" }}>
          {t('c04.025')}
        </span>
      </div>
      <p className="m2rv" style={{ margin: "8px 0 0", fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", lineHeight: "1.3" }}>
        {t('c04.026')}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginTop: "26px" }}>
        <div className="m3pol" style={{ '--r': "-2deg", alignSelf: "flex-start", width: "250px", background: "#FAF7F0", padding: "16px 18px", boxSizing: "border-box", transform: "rotate(-2deg)", boxShadow: "0 14px 24px -14px rgba(57,52,47,.45)" } as CSSProperties}>
          <span style={{ display: "block", fontSize: "9px", letterSpacing: ".28em", color: "#9B7663" }}>
            {t('c04.027')}
          </span>
          <span style={{ display: "block", marginTop: "6px", fontFamily: "'Patrick Hand', cursive", fontSize: "19px" }}>
            <span className="m4strike">
              {t('c04.028')}
            </span>
          </span>
          <span style={{ display: "block", fontFamily: "'Dancing Script', cursive", fontSize: "28px" }}>
            {t('c04.029')}
          </span>
        </div>
        <div className="m3pol" style={{ '--r': "2deg", alignSelf: "flex-end", width: "270px", background: "#FAF7F0", padding: "16px 18px", boxSizing: "border-box", transform: "rotate(2deg)", boxShadow: "0 14px 24px -14px rgba(57,52,47,.45)" } as CSSProperties}>
          <span style={{ display: "block", fontSize: "9px", letterSpacing: ".28em", color: "#9B7663" }}>
            {t('c04.030')}
          </span>
          <span style={{ display: "block", marginTop: "6px", fontFamily: "'Cormorant Garamond', serif", fontSize: "22px" }}>
            <span className="m4strike">
              {t('c04.031')}
            </span>
          </span>
          <span style={{ display: "block", fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", letterSpacing: ".03em" }}>
            {t('c04.032')}
          </span>
          <span style={{ display: "block", fontFamily: "'Patrick Hand', cursive", fontSize: "16px", color: "#A8655A" }}>
            {t('c04.033')}
          </span>
        </div>
        <div className="m3pol" style={{ '--r': "-1.5deg", alignSelf: "flex-start", width: "270px", background: "#E6D8C5", padding: "16px 18px", boxSizing: "border-box", transform: "rotate(-1.5deg)", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" } as CSSProperties}>
          <span style={{ padding: "4px 10px", border: "2px solid #6B6158", color: "#6B6158", fontSize: "11px", letterSpacing: ".22em", opacity: ".7" }}>
            <span className="m4strike">
              {t('c04.034')}
            </span>
          </span>
          <span style={{ fontFamily: "'Patrick Hand', cursive", fontSize: "16px", color: "#525B50" }}>
            →
          </span>
          <span style={{ padding: "5px 10px", border: "2.5px solid #A8655A", color: "#A8655A", fontWeight: "800", fontSize: "14px", transform: "rotate(-4deg)" }}>
            {t('c04.035')}
          </span>
        </div>
        <div className="m3pol" style={{ '--r': "2.5deg", alignSelf: "flex-end", width: "280px", background: "#FAF7F0", padding: "16px 18px", boxSizing: "border-box", transform: "rotate(2.5deg)", boxShadow: "0 14px 24px -14px rgba(57,52,47,.45)" } as CSSProperties}>
          <span style={{ display: "block", fontSize: "9px", letterSpacing: ".28em", color: "#9B7663" }}>
            {t('c04.036')}
          </span>
          <span style={{ display: "block", marginTop: "4px", fontFamily: "Caveat, cursive", fontSize: "22px", color: "#6B6158" }}>
            <span className="m4strike">
              {t('c04.037')}
            </span>
            {' '}
            <span style={{ fontFamily: "'Patrick Hand', cursive", fontSize: "14px", color: "#A8655A" }}>
              {t('c04.038')}
            </span>
          </span>
          <span style={{ display: "block", fontFamily: "'Patrick Hand', cursive", fontSize: "19px" }}>
            {t('c04.039')}
          </span>
        </div>
        <span className="m2rv" style={{ '--r': "-2deg", alignSelf: "center", fontFamily: "'Patrick Hand', cursive", fontSize: "17px", color: "#9B7663", transform: "rotate(-2deg)" } as CSSProperties}>
          {t('c04.040')}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginTop: "56px" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "34px", color: "#9B7663" }}>
          04
        </span>
        <span style={{ fontSize: "10px", letterSpacing: ".3em", color: "#525B50" }}>
          {t('c04.041')}
        </span>
      </div>
      <div style={{ position: "relative", height: "470px", marginTop: "22px" }}>
        <figure className="m3pol" style={{ '--r': "-2deg", position: "absolute", left: "0", top: "20px", width: "300px", margin: "0", background: "#FAF7F0", padding: "9px", boxSizing: "border-box", transform: "rotate(-2deg)", boxShadow: "0 24px 40px -20px rgba(57,52,47,.55)" } as CSSProperties}>
          <img src={asset('shot-cover-closed.jpg')} alt={t('c04.042')} style={{ display: "block", width: "100%", aspectRatio: "16 / 10", objectFit: "cover" }} />
        </figure>
        <figure className="m3pol" style={{ '--r': "4deg", position: "absolute", right: "6px", top: "120px", width: "170px", margin: "0", padding: "7px", background: "#39342F", borderRadius: "24px", boxSizing: "border-box", transform: "rotate(4deg)", boxShadow: "0 30px 46px -20px rgba(57,52,47,.65)", zIndex: "2" } as CSSProperties}>
          <img src={asset('shot-mobile-cover.jpg')} alt={t('c04.043')} style={{ display: "block", width: "100%", aspectRatio: "390 / 844", objectFit: "cover", borderRadius: "18px" }} />
        </figure>
      </div>
      <div className="m2rv" style={{ '--r': ".8deg", position: "relative", margin: "10px 4px 0", background: "#FAF7F0", padding: "28px 24px 22px", boxSizing: "border-box", transform: "rotate(.8deg)", boxShadow: "0 26px 44px -24px rgba(57,52,47,.5)" } as CSSProperties}>
        <p style={{ margin: "0", fontFamily: "'Cormorant Garamond', serif", fontSize: "23px", lineHeight: "1.35" }}>
          {t('c04.044')}
        </p>
        <p style={{ margin: "14px 0 0", textAlign: "right", fontFamily: "'Dancing Script', cursive", fontSize: "24px", color: "#9B7663" }}>
          {t('c04.045')}
        </p>
      </div>
      <div style={{ marginTop: "30px", display: "flex", justifyContent: "center" }}>
        <button type="button" onClick={next} style={{ minHeight: "48px", padding: "0 6px", background: "transparent", border: "0", borderBottom: "1px solid #9B7663", color: "#39342F", fontFamily: "'Patrick Hand', cursive", fontSize: "20px", cursor: "pointer" }}>
          {t('c04.046')}
        </button>
      </div>
    </div>
  )
}
