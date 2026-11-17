import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

/**
 * Background music through the official YouTube IFrame Player API.
 * - Nothing PLAYS until the user presses "Open our story" (or the play button). The player itself
 *   is created (cued, autoplay off, silent) as soon as the video id is known after sign-in, so the
 *   first click can call playVideo() synchronously: Safari / iOS only allow playback that starts
 *   inside the user gesture, not later in an async onReady callback.
 * - The player lives above the router, so it keeps playing across chapters.
 * - If the browser still blocks playback (or the click came before the player was ready) we show
 *   "tap to play": that next tap is a fresh user gesture and plays synchronously.
 * - iOS ignores setVolume(): no fade-in there and no volume slider, only mute / unmute.
 * Audio is never downloaded or extracted: the video is played by YouTube's own
 * embedded player (hidden), which is what the embed terms allow.
 */

type YTPlayer = {
  playVideo(): void
  pauseVideo(): void
  setVolume(v: number): void
  getVolume(): number
  mute(): void
  unMute(): void
  getPlayerState(): number
  seekTo(s: number, allow: boolean): void
  destroy(): void
}
type YTNamespace = {
  Player: new (el: HTMLElement, opts: unknown) => YTPlayer
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number; BUFFERING: number }
}
declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

export type MusicStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'blocked' | 'unavailable'

type MusicState = {
  started: boolean
  status: MusicStatus
  muted: boolean
  volume: number
  /** False on iOS, where the page cannot set the volume (only mute / unmute). */
  canSetVolume: boolean
  /** Call from a click handler: starts playback synchronously (or shows "tap to play"). */
  start: () => void
  toggle: () => void
  toggleMute: () => void
  setVolume: (v: number) => void
}

const MusicContext = createContext<MusicState | null>(null)

/** iPhone / iPod / iPad, including iPadOS that reports itself as a Mac. */
// eslint-disable-next-line react-refresh/only-export-components
export const IS_IOS: boolean =
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1))
const TARGET_VOLUME_DEFAULT = 55
const FADE_MS = 2500

let apiPromise: Promise<YTNamespace> | null = null
/** Loads only the YouTube API script (no player, no audio) so playback can start quickly after a click. */
export function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        prev?.()
        if (window.YT) resolve(window.YT)
      }
      const s = document.createElement('script')
      s.src = 'https://www.youtube.com/iframe_api'
      s.async = true
      s.onerror = () => {
        apiPromise = null
        reject(new Error('YouTube API failed to load'))
      }
      document.head.appendChild(s)
    })
  }
  return apiPromise
}

export function MusicProvider({ videoId, children }: { videoId?: string; children: ReactNode }) {
  const [started, setStarted] = useState(false)
  const [status, setStatus] = useState<MusicStatus>('idle')
  const [muted, setMuted] = useState(false)
  const [volume, setVolumeState] = useState(() => {
    const saved = Number(sessionStorageGet('ols-volume'))
    return saved >= 0 && saved <= 100 && saved !== 0 ? saved : TARGET_VOLUME_DEFAULT
  })
  const hostRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const readyRef = useRef(false)
  /** The user asked to play before the player was ready: show "tap to play" on ready. */
  const wantPlayRef = useRef(false)
  const ytRef = useRef<YTNamespace | null>(null)
  const fadeRef = useRef<number | undefined>(undefined)
  const blockTimer = useRef<number | undefined>(undefined)
  const volumeRef = useRef(volume)
  const mutedRef = useRef(muted)
  useEffect(() => {
    volumeRef.current = volume
  }, [volume])
  useEffect(() => {
    mutedRef.current = muted
  }, [muted])

  const fadeIn = useCallback(() => {
    const p = playerRef.current
    if (!p || IS_IOS) return // iOS ignores setVolume
    window.clearInterval(fadeRef.current)
    let v = 0
    p.setVolume(0)
    const step = volumeRef.current / (FADE_MS / 100)
    fadeRef.current = window.setInterval(() => {
      v = Math.min(volumeRef.current, v + step)
      p.setVolume(Math.round(v))
      if (v >= volumeRef.current) window.clearInterval(fadeRef.current)
    }, 100)
  }, [])

  const watchForBlock = useCallback(() => {
    window.clearTimeout(blockTimer.current)
    blockTimer.current = window.setTimeout(() => {
      const p = playerRef.current
      const YT = ytRef.current
      if (!p || !YT) return
      const st = p.getPlayerState()
      if (st !== YT.PlayerState.PLAYING && st !== YT.PlayerState.BUFFERING) setStatus('blocked')
    }, 1800)
  }, [])

  // Create (cue) the player as soon as the video id is known. autoplay: 0 — this loads the
  // player only; no sound until the user's click calls playVideo().
  useEffect(() => {
    if (!videoId) return
    let cancelled = false
    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !hostRef.current || playerRef.current) return
        ytRef.current = YT
        const el = document.createElement('div')
        hostRef.current.appendChild(el)
        playerRef.current = new YT.Player(el, {
          width: 200,
          height: 200,
          videoId,
          playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, loop: 1, playlist: videoId, modestbranding: 1, rel: 0, playsinline: 1 },
          events: {
            onReady: () => {
              readyRef.current = true
              // Never auto-play here (it would be outside the user gesture on Safari):
              // if the user already clicked, ask for one more tap.
              if (wantPlayRef.current) setStatus('blocked')
            },
            onStateChange: (e: { data: number }) => {
              if (e.data === YT.PlayerState.PLAYING) {
                wantPlayRef.current = false
                setStatus('playing')
              } else if (e.data === YT.PlayerState.PAUSED) setStatus((s) => (s === 'blocked' ? s : 'paused'))
              else if (e.data === YT.PlayerState.ENDED) {
                playerRef.current?.seekTo(0, true)
                playerRef.current?.playVideo()
              }
            },
            onError: () => setStatus('unavailable'),
          },
        })
      })
      .catch(() => {
        if (!cancelled) setStatus('unavailable')
      })
    return () => {
      cancelled = true
    }
  }, [videoId])

  /** Plays synchronously — must be called directly from a click / tap handler. */
  const playNow = useCallback(() => {
    const p = playerRef.current
    if (!videoId) {
      setStatus('unavailable')
      return
    }
    if (!p || !readyRef.current) {
      wantPlayRef.current = true
      setStatus('loading')
      return
    }
    if (mutedRef.current) p.mute()
    else p.unMute()
    p.playVideo() // synchronous, inside the user gesture
    fadeIn() // after playVideo
    watchForBlock()
  }, [videoId, fadeIn, watchForBlock])

  const start = useCallback(() => {
    setStarted(true)
    playNow()
  }, [playNow])

  const toggle = useCallback(() => {
    const p = playerRef.current
    if (p && readyRef.current && status === 'playing') {
      p.pauseVideo()
      setStatus('paused')
      return
    }
    setStarted(true)
    playNow()
  }, [status, playNow])

  const toggleMute = useCallback(() => {
    const next = !mutedRef.current
    const p = playerRef.current
    if (p && readyRef.current) {
      if (next) p.mute()
      else p.unMute()
    }
    mutedRef.current = next
    setMuted(next)
  }, [])

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(v)))
    setVolumeState(clamped)
    sessionStorageSet('ols-volume', String(clamped))
    window.clearInterval(fadeRef.current)
    playerRef.current?.setVolume(clamped)
    if (clamped > 0 && mutedRef.current) {
      playerRef.current?.unMute()
      mutedRef.current = false
      setMuted(false)
    }
  }, [])

  useEffect(
    () => () => {
      window.clearInterval(fadeRef.current)
      window.clearTimeout(blockTimer.current)
      playerRef.current?.destroy()
      playerRef.current = null
      readyRef.current = false
    },
    [],
  )

  const value = useMemo(
    () => ({ started, status, muted, volume, canSetVolume: !IS_IOS, start, toggle, toggleMute, setVolume }),
    [started, status, muted, volume, start, toggle, toggleMute, setVolume],
  )

  return (
    <MusicContext.Provider value={value}>
      {children}
      {/* Host for the YouTube player: inside the viewport (iOS may refuse to play off-screen video),
          practically invisible, never display:none. */}
      <div
        ref={hostRef}
        aria-hidden="true"
        style={{ position: 'fixed', left: 0, bottom: 0, width: 2, height: 2, overflow: 'hidden', opacity: 0.01, pointerEvents: 'none', zIndex: -1 }}
      />
    </MusicContext.Provider>
  )
}

function sessionStorageGet(k: string): string | null {
  try {
    return window.sessionStorage.getItem(k)
  } catch {
    return null
  }
}
function sessionStorageSet(k: string, v: string): void {
  try {
    window.sessionStorage.setItem(k, v)
  } catch {
    // storage blocked: volume just won't be remembered
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMusic(): MusicState {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error('useMusic must be used inside <MusicProvider>')
  return ctx
}
