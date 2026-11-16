import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { InvitationSession } from '../chapters/invitation/InvitationSession'
import { ChatSession } from '../chat/ChatSession'
import ChatChapter from '../chapters/ChatChapter'
import CoverChapter from '../chapters/CoverChapter'
import CuriousChapter from '../chapters/CuriousChapter'
import InvitationChapter from '../chapters/InvitationChapter'
import LetterChapter from '../chapters/LetterChapter'
import MakingOfChapter from '../chapters/MakingOfChapter'
import MatchChapter from '../chapters/MatchChapter'
import UnwrittenChapter from '../chapters/UnwrittenChapter'
import CoverDesktop from '../chapters/desktop/CoverDesktop'
import ChatDesktop from '../chapters/desktop/ChatDesktop'
import CuriousDesktop from '../chapters/desktop/CuriousDesktop'
import InvitationDesktop from '../chapters/desktop/InvitationDesktop'
import LetterDesktop from '../chapters/desktop/LetterDesktop'
import MakingOfDesktop from '../chapters/desktop/MakingOfDesktop'
import UnwrittenDesktop from '../chapters/desktop/UnwrittenDesktop'
import MatchDesktop from '../chapters/desktop/MatchDesktop'
import type { ChapterProps, LetterSeal } from '../chapters/types'
import { loadYouTubeApi, useMusic } from '../music/MusicContext'
import { useStory } from '../story/StoryContext'
import DesktopShell from './DesktopShell'
import Lightbox from './Lightbox'
import MusicPostcard from './MusicPostcard'
import { useIsDesktop } from './useIsDesktop'

type ChapterView = (p: ChapterProps) => React.JSX.Element
/** Each chapter has a mobile and a desktop layout; both read the same story data and layout state. */
const CHAPTERS: { Mobile: ChapterView; Desktop: ChapterView }[] = [
  { Mobile: CoverChapter, Desktop: CoverDesktop },
  { Mobile: MatchChapter, Desktop: MatchDesktop },
  { Mobile: CuriousChapter, Desktop: CuriousDesktop },
  { Mobile: MakingOfChapter, Desktop: MakingOfDesktop },
  { Mobile: LetterChapter, Desktop: LetterDesktop },
  { Mobile: UnwrittenChapter, Desktop: UnwrittenDesktop },
  { Mobile: InvitationChapter, Desktop: InvitationDesktop },
  { Mobile: ChatChapter, Desktop: ChatDesktop },
]
const LAST = CHAPTERS.length - 1
const DARK_PAGE = 4 // the letter chapter has a dark desk background

const isNav = (el: EventTarget | null) =>
  el instanceof Element && !!el.closest('button, a, input, textarea, select, label, [data-nonav]')

/**
 * The book: progress segments, chapter title, music controls, prev/next,
 * swipe and tap-zone navigation, page-turn animation, chapter sheet and photo viewer.
 * Layout and colours follow the "Mobile story mode" design; on wide screens the same
 * page is shown as a book on a desk.
 */
export default function StoryLayout() {
  const { chapter } = useParams()
  const navigate = useNavigate()
  const { story, error, t } = useStory()
  const music = useMusic()
  const { logout, user } = useAuth()
  const page = Math.min(LAST, Math.max(0, (Number(chapter) || 1) - 1))
  const [dir, setDir] = useState<'next' | 'prev'>('next')
  const [sheet, setSheet] = useState(false)
  const [lb, setLb] = useState(-1)
  const [coverOpen, setCoverOpen] = useState(false)
  const [letter, setLetter] = useState<LetterSeal>('sealed')
  const [unwrittenOpen, setUnwrittenOpen] = useState(false)
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const swiped = useRef(false)
  const isDesktop = useIsDesktop()

  useEffect(() => {
    if (story?.music?.youtubeVideoId) loadYouTubeApi().catch(() => undefined)
  }, [story?.music?.youtubeVideoId])

  const go = useCallback(
    (n: number) => {
      if (n < 0 || n > LAST || n === page) return
      setDir(n > page ? 'next' : 'prev')
      setSheet(false)
      setLb(-1)
      navigate(`/story/${n + 1}`)
    },
    [page, navigate],
  )

  // Desktop pages scroll with the window: start each chapter at the top.
  useEffect(() => {
    if (isDesktop) window.scrollTo(0, 0)
  }, [page, isDesktop])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, [contenteditable]')) return
      if (lb >= 0 || sheet) {
        if (e.key === 'Escape') {
          setLb(-1)
          setSheet(false)
        }
        return
      }
      if (e.key === 'ArrowRight') go(page + 1)
      if (e.key === 'ArrowLeft') go(page - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, page, lb, sheet])

  if (!chapter || String(page + 1) !== chapter) return <Navigate to={`/story/${page + 1}`} replace />

  if (error) {
    return (
      <div className="desk" style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: '#FAF7F0', padding: 28, maxWidth: 420, fontFamily: "'Patrick Hand', cursive", fontSize: 19, color: '#39342F' }}>
          Không tải được nội dung câu chuyện ({error}). Kiểm tra OLS_STORY_DIR trên máy chủ — xem docs/STORY_CONTENT.md.
        </div>
      </div>
    )
  }
  if (!story) {
    return (
      <div className="desk" style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "'Patrick Hand', cursive", fontSize: 22, color: '#E6D8C5' }}>đang mở cuốn sổ…</span>
      </div>
    )
  }

  const titles = story.chapterTitles
  const dark = page === DARK_PAGE
  const on = music.status === 'playing'
  const blocked = music.status === 'blocked'
  const hdr = dark
    ? { bg: 'linear-gradient(180deg, rgba(57,52,47,.95), rgba(57,52,47,0))', fg: '#FAF7F0', eq: '#C78F91', ring: 'rgba(250,247,240,.5)' }
    : { bg: 'linear-gradient(180deg, rgba(243,235,221,.97) 70%, rgba(243,235,221,0))', fg: '#39342F', eq: '#9B7663', ring: 'rgba(57,52,47,.2)' }

  const onPointerDown = (e: PointerEvent) => {
    swipe.current = isNav(e.target) ? null : { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e: PointerEvent) => {
    if (!swipe.current) return
    const dx = e.clientX - swipe.current.x
    const dy = e.clientY - swipe.current.y
    swipe.current = null
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      swiped.current = true
      go(page + (dx < 0 ? 1 : -1))
    }
  }
  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (swiped.current) {
      swiped.current = false
      return
    }
    if (isNav(e.target) || window.getSelection()?.toString()) return
    const r = e.currentTarget.getBoundingClientRect()
    const fx = (e.clientX - r.left) / r.width
    if (fx > 0.72) go(page + 1)
    else if (fx < 0.22) go(page - 1)
  }

  const props: ChapterProps = {
    turn: dir === 'next' ? 'turn-next' : 'turn-prev',
    next: () => go(page + 1),
    go,
    openPhoto: setLb,
    coverOpen,
    openCover: () => {
      setCoverOpen(true)
      if (!music.started) music.start()
    },
    closeCover: () => setCoverOpen(false),
    letter,
    setLetter,
    unwrittenOpen,
    openUnwritten: () => setUnwrittenOpen(true),
  }

  // Invitation (ch. 07) and chat (ch. 08) sessions wrap BOTH layouts, so resizing keeps them.
  const sessions = (view: React.JSX.Element) => (
    <InvitationSession enabled={page === 6}>
      <ChatSession enabled={page === 7} myId={user?.id}>
        {view}
      </ChatSession>
    </InvitationSession>
  )

  if (isDesktop) {
    const Desk = CHAPTERS[page].Desktop
    return sessions(
      <DesktopShell
        page={page}
        dark={dark}
        titles={titles}
        go={go}
        t={t}
        userName={user?.displayName}
        onLogout={() => void logout()}
        overlays={
          <>
            <MusicPostcard t={t} title={story.music?.title} />
            {lb >= 0 && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 40 }}>
                <Lightbox wide photos={story.lightbox} index={lb} onIndex={setLb} onClose={() => setLb(-1)} t={t} />
              </div>
            )}
          </>
        }
      >
        <Desk {...props} />
      </DesktopShell>,
    )
  }

  const Chapter = CHAPTERS[page].Mobile

  const iconBtn = { width: 40, height: 44, border: 0, background: 'transparent', color: hdr.fg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } as const

  return sessions(
    <div className="desk" style={{ minHeight: '100dvh' }}>
      <div className="story-frame" style={{ background: dark ? '#39342F' : '#F3EBDD', color: '#39342F', fontFamily: 'Inter, sans-serif' }}>
        <main className="pg" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onClick={onClick} style={{ position: 'absolute', inset: 0 }}>
          <Chapter key={page} {...props} />
        </main>

        <header style={{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 20, padding: '10px 10px 0', boxSizing: 'border-box', background: hdr.bg }}>
          <div aria-hidden="true" style={{ display: 'flex', gap: 4, padding: '0 2px' }}>
            {CHAPTERS.map((_, i) => (
              <span key={i} style={{ flex: 1, height: 3, borderRadius: 2, transition: 'background .4s ease', background: i <= page ? (dark ? '#FAF7F0' : '#39342F') : dark ? 'rgba(250,247,240,.25)' : 'rgba(57,52,47,.18)' }} />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', height: 54 }}>
            <button type="button" onClick={() => go(page - 1)} disabled={page === 0} aria-label="Previous chapter" style={{ ...iconBtn, opacity: page === 0 ? 0.3 : 1 }}>
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button type="button" onClick={() => setSheet(true)} aria-label="All chapters" aria-expanded={sheet} style={{ flex: 1, minWidth: 0, minHeight: 44, padding: '0 4px', border: 0, background: 'transparent', color: hdr.fg, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <span style={{ fontSize: 10, letterSpacing: '.14em', opacity: 0.75 }}>{String(page + 1).padStart(2, '0')} / {String(CHAPTERS.length).padStart(2, '0')}</span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 18, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{titles[page]}</span>
            </button>
            {music.started && music.status !== 'unavailable' && (
              <>
                <button type="button" onClick={music.toggle} aria-label={blocked ? 'Tap to play music' : on ? 'Pause music' : 'Play music'} style={{ position: 'relative', width: 44, height: 44, border: 0, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span aria-hidden="true" className={on ? 'spin' : ''} style={{ width: 30, height: 30, borderRadius: '50%', background: '#39342F', backgroundImage: 'repeating-radial-gradient(circle, rgba(250,247,240,.1) 0 1px, transparent 1px 4px)', boxShadow: `0 0 0 1px ${hdr.ring}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#C78F91' }} />
                  </span>
                  {!on && (
                    <span aria-hidden="true" style={{ position: 'absolute', right: 4, bottom: 6, width: 14, height: 14, borderRadius: '50%', background: '#FAF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="#39342F"><path d="M7 4l13 8-13 8z" /></svg>
                    </span>
                  )}
                  {blocked && <span aria-hidden="true" className="pulse" style={{ position: 'absolute', inset: 6, borderRadius: '50%' }} />}
                </button>
                <div aria-hidden="true" style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 12, width: 14, margin: '0 2px', opacity: on && !music.muted ? 1 : 0.35 }}>
                  {[0, -0.35, -0.7, -0.2].map((d, i) => (
                    <span key={i} className={on && !music.muted ? 'eq' : ''} style={{ width: 2, height: 12, background: hdr.eq, animationDelay: `${d}s` }} />
                  ))}
                </div>
                <button type="button" onClick={music.toggleMute} aria-label={music.muted ? 'Unmute music' : 'Mute music'} aria-pressed={music.muted} style={iconBtn}>
                  {music.muted ? (
                    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M17 9l5 6M22 9l-5 6" /></svg>
                  ) : (
                    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M17 9a4 4 0 0 1 0 6M19.5 6.5a8 8 0 0 1 0 11" /></svg>
                  )}
                </button>
              </>
            )}
            <button type="button" onClick={() => go(page + 1)} disabled={page === LAST} aria-label="Next chapter" style={{ ...iconBtn, opacity: page === LAST ? 0.3 : 1 }}>
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </header>

        {sheet && (
          <div className="fade" onClick={() => setSheet(false)} style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(57,52,47,.45)' }}>
            <nav className="sheet" aria-label="Chapters" onClick={(e) => e.stopPropagation()} style={{ background: '#FAF7F0', padding: '14px 16px 18px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px -20px rgba(57,52,47,.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontFamily: 'Caveat, cursive', fontSize: 22, color: '#9B7663' }}>the chapters</span>
                <button type="button" onClick={() => setSheet(false)} aria-label="Close chapters" style={{ width: 44, height: 44, border: 0, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39342F" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              </div>
              {titles.map((title, i) => (
                <button key={i} type="button" onClick={() => go(i)} aria-current={i === page ? 'page' : undefined} style={{ minHeight: 48, display: 'flex', alignItems: 'center', gap: 14, padding: 0, border: 0, borderTop: '1px solid #E6D8C5', background: 'transparent', textAlign: 'left', color: i === page ? '#39342F' : '#6B6158', cursor: 'pointer' }}>
                  <span style={{ width: 22, fontSize: 11, letterSpacing: '.12em' }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ flex: 1, fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontStyle: i === page ? 'italic' : 'normal' }}>{title}</span>
                  <span style={{ width: i === page ? 30 : 0, height: 1, background: '#9B7663' }} />
                </button>
              ))}
              <div style={{ borderTop: '1px solid #E6D8C5', paddingTop: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, fontSize: 10, letterSpacing: '.2em', color: '#6B6158' }}>
                  ÂM LƯỢNG
                  <input className="vol" type="range" min={0} max={100} value={music.muted ? 0 : music.volume} onChange={(e) => music.setVolume(Number(e.target.value))} aria-label="Music volume" style={{ flex: 1 }} />
                </label>
                {!music.started && story.music?.youtubeVideoId && (
                  <button type="button" onClick={music.start} style={{ minHeight: 40, padding: '0 12px', border: '1px solid #CDBBA3', background: 'transparent', fontSize: 11, letterSpacing: '.14em', cursor: 'pointer' }}>PLAY</button>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span style={{ fontSize: 11, color: '#6B6158' }}>{user?.displayName}</span>
                <button type="button" onClick={() => void logout()} style={{ minHeight: 40, padding: '0 12px', border: 0, background: 'transparent', color: '#39342F', fontSize: 11, letterSpacing: '.16em', textDecoration: 'underline', cursor: 'pointer' }}>
                  ĐĂNG XUẤT
                </button>
              </div>
            </nav>
          </div>
        )}

        {lb >= 0 && <Lightbox photos={story.lightbox} index={lb} onIndex={setLb} onClose={() => setLb(-1)} t={t} />}
      </div>
      <p className="desk-hint" aria-hidden="true">← → để lật trang</p>
    </div>
  )
}
