import type { CSSProperties } from 'react'
import { useStory } from '../story/StoryContext'
import type { ChapterProps } from './types'

export default function CuriousChapter({ turn, next, openPhoto }: ChapterProps) {
  const { t, asset } = useStory()
  return (
    <div className={`pg ${turn}`} style={{ position: "absolute", inset: "0", overflowY: "auto", overflowX: "hidden", background: "#F3EBDD", padding: "92px 20px 50px", boxSizing: "border-box" }}>
      <span style={{ fontSize: "10px", letterSpacing: ".3em", color: "#525B50" }}>
        {t('c03.001')}
      </span>
      <h2 style={{ margin: "8px 0 0", fontFamily: "'Cormorant Garamond', serif", fontWeight: "500", fontSize: "38px", lineHeight: "1.05" }}>
        {t('c03.002')}{' '}
        <em style={{ fontWeight: "400", color: "#9B7663" }}>
          {t('c03.003')}
        </em>
        {' '}{t('c03.004')}
      </h2>
      <p style={{ margin: "6px 0 0", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "20px", color: "#525B50" }}>
        {t('c03.005')}
      </p>
      <span style={{ display: "inline-block", marginTop: "12px", padding: "5px 10px", border: "1.5px dashed #9B7663", fontFamily: "'Patrick Hand', cursive", fontSize: "16px", color: "#9B7663", transform: "rotate(-3deg)" }}>
        {t('c03.006')}
      </span>
      <div className="m2rv" style={{ '--r': "-1deg", position: "relative", marginTop: "30px", background: "#FAF7F0", backgroundImage: "repeating-linear-gradient(180deg, transparent 0 29px, rgba(155,118,99,.2) 29px 30px)", padding: "26px 20px 26px 40px", boxSizing: "border-box", transform: "rotate(-1deg)", boxShadow: "0 20px 34px -20px rgba(57,52,47,.45)" } as CSSProperties}>
        <div aria-hidden="true" style={{ position: "absolute", left: "26px", top: "0", bottom: "0", width: "1px", background: "rgba(199,143,145,.6)" }}></div>
        <div aria-hidden="true" style={{ position: "absolute", left: "40%", top: "-10px", width: "80px", height: "20px", background: "rgba(82,91,80,.32)", transform: "rotate(-3deg)" }}></div>
        <span style={{ display: "block", fontSize: "9px", letterSpacing: ".3em", color: "#9B7663", lineHeight: "30px" }}>
          {t('c03.007')}
        </span>
        <p style={{ margin: "0", fontFamily: "'Patrick Hand', cursive", fontSize: "18px", lineHeight: "30px" }}>
          {t('c03.008')}
        </p>
        <p style={{ margin: "30px 0 0", fontFamily: "'Patrick Hand', cursive", fontSize: "18px", lineHeight: "30px" }}>
          {t('c03.009')}
        </p>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-8px" }}>
        <span className="m2rv" style={{ '--r': "4deg", position: "relative", padding: "9px 14px", background: "#E6D8C5", fontFamily: "'Patrick Hand', cursive", fontSize: "18px", color: "#525B50", transform: "rotate(4deg)", boxShadow: "0 10px 18px -12px rgba(57,52,47,.4)" } as CSSProperties}>
          {t('c03.010')}
        </span>
      </div>
      <div style={{ position: "relative", height: "330px", marginTop: "40px" }}>
        <button className="tap m3pol" type="button" onClick={() => openPhoto(0)} aria-label={t('c03.011')} style={{ '--r': "-4deg", position: "absolute", left: "0", top: "0", width: "200px", padding: "9px 9px 28px", background: "#FAF7F0", border: "0", cursor: "zoom-in", transform: "rotate(-4deg)", boxShadow: "0 16px 28px -14px rgba(57,52,47,.55)" } as CSSProperties}>
          <span aria-hidden="true" style={{ position: "absolute", left: "50%", top: "-9px", width: "70px", height: "18px", marginLeft: "-35px", background: "rgba(199,143,145,.55)", transform: "rotate(-4deg)" }}></span>
          <img src={asset('aodai.jpg')} alt={t('c03.012')} style={{ display: "block", width: "100%", aspectRatio: "3 / 4.4", objectFit: "cover", objectPosition: "50% 42%" }} />
        </button>
        <p className="m3cap" style={{ '--r': "-2deg", position: "absolute", left: "214px", top: "50px", width: "136px", margin: "0", fontFamily: "'Patrick Hand', cursive", fontSize: "17px", lineHeight: "1.3", color: "#9B7663", transform: "rotate(-2deg)" } as CSSProperties}>
          {t('c03.013')}
        </p>
      </div>
      <div style={{ position: "relative", height: "420px", marginTop: "10px" }}>
        <button className="tap m3pol" type="button" onClick={() => openPhoto(2)} aria-label={t('c03.014')} style={{ '--r': "2deg", position: "absolute", right: "0", top: "0", width: "236px", padding: "10px 10px 30px", background: "#FAF7F0", border: "0", cursor: "zoom-in", transform: "rotate(2deg)", boxShadow: "0 16px 28px -14px rgba(57,52,47,.55)" } as CSSProperties}>
          <span aria-hidden="true" style={{ position: "absolute", right: "-10px", top: "6px", width: "56px", height: "16px", background: "rgba(82,91,80,.35)", transform: "rotate(40deg)" }}></span>
          <img src={asset('plants.jpg')} alt={t('c03.015')} style={{ display: "block", width: "100%", aspectRatio: "3 / 4.2", objectFit: "cover", objectPosition: "50% 25%" }} />
        </button>
        <button className="tap m3pol" type="button" onClick={() => openPhoto(1)} aria-label={t('c03.016')} style={{ '--r': "-5deg", position: "absolute", left: "0", top: "170px", width: "148px", zIndex: "2", padding: "8px 8px 26px", background: "#FAF7F0", border: "0", cursor: "zoom-in", transform: "rotate(-5deg)", boxShadow: "0 16px 28px -14px rgba(57,52,47,.55)" } as CSSProperties}>
          <img src={asset('balcony.jpg')} alt={t('c03.017')} style={{ display: "block", width: "100%", aspectRatio: "3 / 4.4", objectFit: "cover", objectPosition: "50% 40%" }} />
        </button>
      </div>
      <p className="m3cap" style={{ '--r': "-1deg", margin: "8px 0 0", textAlign: "center", fontFamily: "'Patrick Hand', cursive", fontSize: "20px", color: "#525B50", transform: "rotate(-1deg)" } as CSSProperties}>
        {t('c03.018')}
      </p>
      <div style={{ position: "relative", height: "270px", marginTop: "26px" }}>
        <button className="tap m3pol" type="button" onClick={() => openPhoto(3)} aria-label={t('c03.019')} style={{ '--r': "4deg", position: "absolute", left: "4px", top: "0", width: "164px", padding: "8px 8px 26px", background: "#FAF7F0", border: "0", cursor: "zoom-in", transform: "rotate(4deg)", boxShadow: "0 16px 28px -14px rgba(57,52,47,.55)" } as CSSProperties}>
          <img src={asset('matcha.jpg')} alt={t('c03.020')} style={{ display: "block", width: "100%", aspectRatio: "3 / 4", objectFit: "cover", objectPosition: "50% 45%" }} />
        </button>
        <button className="tap m3pol" type="button" onClick={() => openPhoto(4)} aria-label={t('c03.021')} style={{ '--r': "-3deg", position: "absolute", right: "4px", top: "44px", width: "164px", zIndex: "2", padding: "8px 8px 26px", background: "#FAF7F0", border: "0", cursor: "zoom-in", transform: "rotate(-3deg)", boxShadow: "0 16px 28px -14px rgba(57,52,47,.55)" } as CSSProperties}>
          <span aria-hidden="true" style={{ position: "absolute", left: "50%", top: "-9px", width: "70px", height: "18px", marginLeft: "-35px", background: "rgba(199,143,145,.55)", transform: "rotate(-4deg)" }}></span>
          <img src={asset('sunglasses.jpg')} alt={t('c03.022')} style={{ display: "block", width: "100%", aspectRatio: "1 / 1", objectFit: "cover", objectPosition: "48% 40%" }} />
        </button>
      </div>
      <div style={{ position: "relative", height: "340px", marginTop: "24px" }}>
        <button className="tap m3pol" type="button" onClick={() => openPhoto(5)} aria-label={t('c03.023')} style={{ '--r': "3deg", position: "absolute", right: "0", top: "0", width: "212px", padding: "9px 9px 28px", background: "#FAF7F0", border: "0", cursor: "zoom-in", transform: "rotate(3deg)", boxShadow: "0 16px 28px -14px rgba(57,52,47,.55)" } as CSSProperties}>
          <img src={asset('bench.jpg')} alt={t('c03.024')} style={{ display: "block", width: "100%", aspectRatio: "3 / 4.2", objectFit: "cover", objectPosition: "50% 30%" }} />
        </button>
        <div className="m3cap" style={{ '--r': "-2deg", position: "absolute", left: "0", top: "100px", width: "122px", transform: "rotate(-2deg)" } as CSSProperties}>
          <span style={{ display: "block", fontFamily: "'Patrick Hand', cursive", fontSize: "17px", lineHeight: "1.3", color: "#9B7663" }}>
            {t('c03.025')}
          </span>
          <svg aria-hidden="true" width="40" height="24" viewBox="0 0 40 24" fill="none" stroke="#9B7663" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "4px 0 0 60px" }}>
            <path d="M2 4 C 14 18, 26 20, 37 14" />
            <path d="M30 10l7 4-5 6" />
          </svg>
        </div>
      </div>
      <div style={{ position: "relative", height: "270px", marginTop: "18px" }}>
        <button className="tap m3pol" type="button" onClick={() => openPhoto(6)} aria-label={t('c03.026')} style={{ '--r': "-2deg", position: "absolute", left: "50%", marginLeft: "-140px", top: "0", width: "280px", padding: "9px 9px 28px", background: "#FAF7F0", border: "0", cursor: "zoom-in", transform: "rotate(-2deg)", boxShadow: "0 16px 28px -14px rgba(57,52,47,.55)" } as CSSProperties}>
          <img src={asset('aquarium.jpg')} alt={t('c03.027')} style={{ display: "block", width: "100%", aspectRatio: "4 / 3.3", objectFit: "cover", objectPosition: "50% 30%" }} />
        </button>
      </div>
      <p className="m3cap" style={{ '--r': "1.5deg", margin: "6px 0 0", textAlign: "center", fontFamily: "'Patrick Hand', cursive", fontSize: "19px", lineHeight: "1.3", color: "#39342F", transform: "rotate(1.5deg)" } as CSSProperties}>
        {t('c03.028')}
      </p>
      <div style={{ marginTop: "60px", display: "flex", justifyContent: "center" }}>
        <button className="tap m3smile" type="button" onClick={() => openPhoto(7)} aria-label={t('c03.029')} style={{ position: "relative", width: "310px", padding: "12px 12px 46px", background: "#FAF7F0", border: "0", cursor: "zoom-in", transform: "rotate(-2.5deg)", boxShadow: "0 0 0 1px rgba(155,118,99,.08), 0 40px 60px -28px rgba(57,52,47,.6)" }}>
          <span aria-hidden="true" style={{ position: "absolute", left: "50%", top: "-11px", width: "100px", height: "22px", marginLeft: "-50px", background: "rgba(199,143,145,.55)", transform: "rotate(-3deg)" }}></span>
          <img src={asset('croissant.jpg')} alt={t('c03.030')} style={{ display: "block", width: "100%", aspectRatio: "4 / 5", objectFit: "cover", objectPosition: "50% 30%" }} />
          <span style={{ position: "absolute", left: "16px", bottom: "12px", fontFamily: "'Patrick Hand', cursive", fontSize: "18px", color: "#9B7663" }}>
            {t('c03.031')}
          </span>
        </button>
      </div>
      <p className="m2rv" style={{ margin: "34px 0 0", fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", lineHeight: "1.15" }}>
        {t('c03.032')}
      </p>
      <p className="m2rv" style={{ margin: "12px 0 0", fontFamily: "'Cormorant Garamond', serif", fontSize: "19px", lineHeight: "1.5", color: "#4A443D" }}>
        {t('c03.033')}
      </p>
      <div className="m2rv" style={{ '--r': "-3deg", display: "inline-block", marginTop: "16px", padding: "9px 14px", background: "#FAF7F0", transform: "rotate(-3deg)", boxShadow: "0 10px 18px -12px rgba(57,52,47,.4)" } as CSSProperties}>
        <span style={{ fontFamily: "'Patrick Hand', cursive", fontSize: "18px", color: "#525B50" }}>
          {t('c03.034')}
        </span>
      </div>
      <div className="m2rv" style={{ '--r': ".8deg", position: "relative", margin: "60px 4px 0", background: "#FAF7F0", padding: "34px 24px 26px", boxSizing: "border-box", transform: "rotate(.8deg)", boxShadow: "0 30px 50px -26px rgba(57,52,47,.5)" } as CSSProperties}>
        <div aria-hidden="true" style={{ position: "absolute", left: "22px", top: "-10px", width: "70px", height: "20px", background: "rgba(82,91,80,.32)", transform: "rotate(-5deg)" }}></div>
        <div aria-hidden="true" style={{ position: "absolute", right: "22px", top: "-10px", width: "60px", height: "20px", background: "rgba(199,143,145,.5)", transform: "rotate(6deg)" }}></div>
        <p style={{ margin: "0", fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", lineHeight: "1.45" }}>
          {t('c03.035')}
        </p>
        <p style={{ margin: "14px 0 0", fontFamily: "'Cormorant Garamond', serif", fontSize: "19px", lineHeight: "1.5", color: "#4A443D" }}>
          {t('c03.036')}
        </p>
        <p style={{ margin: "22px 0 0", textAlign: "right", fontFamily: "'Dancing Script', cursive", fontSize: "25px", color: "#9B7663" }}>
          {t('c03.037')}
        </p>
      </div>
      <div style={{ marginTop: "34px", display: "flex", justifyContent: "center" }}>
        <button type="button" onClick={next} style={{ minHeight: "48px", padding: "0 6px", background: "transparent", border: "0", borderBottom: "1px solid #9B7663", color: "#39342F", fontFamily: "'Patrick Hand', cursive", fontSize: "20px", cursor: "pointer" }}>
          {t('c03.038')}
        </button>
      </div>
    </div>
  )
}
