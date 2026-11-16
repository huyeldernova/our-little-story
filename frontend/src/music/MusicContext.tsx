import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

/**
 * Background music through the official YouTube IFrame Player API.
 * - Nothing loads or plays until the user presses "Open our story" (or the play button).
 * - The player lives above the router, so it keeps playing across chapters.
 * - If the browser blocks autoplay we show a gentle "tap to play" state.
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
  /** Call from a click handler: loads the player (first time) and starts playback. */
  start: () => void
  toggle: () => void
  toggleMute: () => void
  setVolume: (v: number) => void
}

const MusicContext = createContext<MusicState | null>(null)
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
  const ytRef = useRef<YTNamespace | null>(null)
  const fadeRef = useRef<number | undefined>(undefined)
  const blockTimer = useRef<number | undefined>(undefined)
  const volumeRef = useRef(volume)
  useEffect(() => {
    volumeRef.current = volume
  }, [volume])

  const fadeIn = useCallback(() => {
    const p = playerRef.current
    if (!p) return
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

  const createPlayer = useCallback(async () => {
    if (!videoId) {
      setStatus('unavailable')
      return
    }
    setStatus('loading')
    try {
      const YT = await loadYouTubeApi()
      ytRef.current = YT
      if (!hostRef.current || playerRef.current) return
      const el = document.createElement('div')
      hostRef.current.appendChild(el)
      playerRef.current = new YT.Player(el, {
        width: 200,
        height: 200,
        videoId,
        playerVars: { autoplay: 1, controls: 0, disablekb: 1, fs: 0, loop: 1, playlist: videoId, modestbranding: 1, rel: 0, playsinline: 1 },
        events: {
          onReady: () => {
            playerRef.current?.playVideo()
            fadeIn()
            watchForBlock()
          },
          onStateChange: (e: { data: number }) => {
            if (e.data === YT.PlayerState.PLAYING) setStatus('playing')
            else if (e.data === YT.PlayerState.PAUSED) setStatus((s) => (s === 'blocked' ? s : 'paused'))
            else if (e.data === YT.PlayerState.ENDED) {
              playerRef.current?.seekTo(0, true)
              playerRef.current?.playVideo()
            }
          },
          onError: () => setStatus('unavailable'),
        },
      })
    } catch {
      setStatus('unavailable')
    }
  }, [videoId, fadeIn, watchForBlock])

  const start = useCallback(() => {
    setStarted(true)
    const p = playerRef.current
    if (!p) {
      void createPlayer()
      return
    }
    p.playVideo()
    fadeIn()
    watchForBlock()
  }, [createPlayer, fadeIn, watchForBlock])

  const toggle = useCallback(() => {
    const p = playerRef.current
    if (!p) {
      start()
      return
    }
    if (status === 'playing') {
      p.pauseVideo()
      setStatus('paused')
    } else {
      p.playVideo()
      fadeIn()
      watchForBlock()
    }
  }, [status, start, fadeIn, watchForBlock])

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m
      const p = playerRef.current
      if (p) {
        if (next) p.mute()
        else p.unMute()
      }
      return next
    })
  }, [])

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(v)))
    setVolumeState(clamped)
    sessionStorageSet('ols-volume', String(clamped))
    window.clearInterval(fadeRef.current)
    playerRef.current?.setVolume(clamped)
    if (clamped > 0 && muted) {
      playerRef.current?.unMute()
      setMuted(false)
    }
  }, [muted])

  useEffect(
    () => () => {
      window.clearInterval(fadeRef.current)
      window.clearTimeout(blockTimer.current)
      playerRef.current?.destroy()
      playerRef.current = null
    },
    [],
  )

  const value = useMemo(
    () => ({ started, status, muted, volume, start, toggle, toggleMute, setVolume }),
    [started, status, muted, volume, start, toggle, toggleMute, setVolume],
  )

  return (
    <MusicContext.Provider value={value}>
      {children}
      {/* Off-screen host for the YouTube player (must not be display:none or it won't play). */}
      <div
        ref={hostRef}
        aria-hidden="true"
        style={{ position: 'fixed', left: -9999, top: -9999, width: 200, height: 200, opacity: 0, pointerEvents: 'none' }}
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
