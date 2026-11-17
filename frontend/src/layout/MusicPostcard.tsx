import { useMusic } from '../music/MusicContext'

type Props = {
  t: (key: string) => string
  /** Song title from story.json (music.title); hidden when not set. */
  title?: string
}

/**
 * Desktop music player: the taped "postcard" in the bottom-right corner (Main.dc.html),
 * driven by the same useMusic() state as the mobile header, plus a volume slider.
 */
export default function MusicPostcard({ t, title }: Props) {
  const music = useMusic()
  if (!music.started || music.status === 'unavailable') return null
  const playing = music.status === 'playing'
  const blocked = music.status === 'blocked'
  const iconBtn = { width: 44, height: 44, flex: '0 0 auto', border: 0, borderRadius: '50%', background: 'transparent', color: '#39342F', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } as const

  return (
    <div className="d-mp-in" role="region" aria-label="Background music" style={{ position: 'fixed', right: 28, bottom: 28, zIndex: 10, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px 10px 12px', background: '#FAF7F0', border: '1px solid #E6D8C5', borderRadius: 3, transform: 'rotate(-1.5deg)', boxShadow: '0 2px 3px rgba(57,52,47,.1), 0 18px 34px -16px rgba(57,52,47,.45)' }}>
      <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: -10, width: 64, height: 18, marginLeft: -32, background: 'rgba(199,143,145,.55)', transform: 'rotate(3deg)' }} />
      <div aria-hidden="true" className={playing ? 'spin' : ''} style={{ position: 'relative', width: 38, height: 38, flex: '0 0 auto', borderRadius: '50%', background: '#39342F', backgroundImage: 'repeating-radial-gradient(circle, rgba(250,247,240,.08) 0 1px, transparent 1px 4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ width: 13, height: 13, borderRadius: '50%', background: '#C78F91', border: '2px solid #39342F' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 92 }}>
        <span style={{ fontSize: 9, letterSpacing: '.24em', color: '#6B6158' }}>{playing ? t('d01.009') : t('d01.010')}</span>
        {title && <span style={{ fontFamily: "'Patrick Hand', cursive", fontSize: 19, lineHeight: 1.1, color: '#39342F', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>}
      </div>
      {blocked ? (
        <button className="d-mp-btn" type="button" onClick={music.toggle} aria-label="Tap to play music" style={{ minHeight: 44, padding: '0 14px', border: '1px dashed #9B7663', borderRadius: 2, background: 'transparent', color: '#39342F', fontFamily: 'Inter, sans-serif', fontSize: 11, letterSpacing: '.14em', cursor: 'pointer' }}>
          {t('d01.011')}
        </button>
      ) : (
        <>
          <div aria-hidden="true" style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 16, width: 20, opacity: playing && !music.muted ? 1 : 0.35 }}>
            {[0, -0.35, -0.7, -0.2].map((d, i) => (
              <span key={i} className={playing && !music.muted ? 'eq' : ''} style={{ width: 3, height: 16, background: '#9B7663', animationDelay: `${d}s` }} />
            ))}
          </div>
          <button className="d-mp-btn" type="button" onClick={music.toggle} aria-label={playing ? 'Pause music' : 'Play music'} style={iconBtn}>
            {playing ? (
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
            ) : (
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l12 7-12 7z" /></svg>
            )}
          </button>
          <button className="d-mp-btn" type="button" onClick={music.toggleMute} aria-label={music.muted ? 'Unmute music' : 'Mute music'} aria-pressed={music.muted} style={iconBtn}>
            {music.muted ? (
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M17 9l5 6M22 9l-5 6" /></svg>
            ) : (
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M17 9a4 4 0 0 1 0 6M19.5 6.5a8 8 0 0 1 0 11" /></svg>
            )}
          </button>
          {music.canSetVolume && <input className="vol" type="range" min={0} max={100} value={music.muted ? 0 : music.volume} onChange={(e) => music.setVolume(Number(e.target.value))} aria-label="Music volume" style={{ width: 84, margin: '0 4px 0 0' }} />}
        </>
      )}
    </div>
  )
}
