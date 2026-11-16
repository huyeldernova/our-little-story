import { useSyncExternalStore } from 'react'

/** Desktop layout breakpoint (the design canvases are 1440 px; below this the mobile story mode is used). */
export const DESKTOP_QUERY = '(min-width: 1024px)'

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => undefined
  const mql = window.matchMedia(DESKTOP_QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function getSnapshot(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(DESKTOP_QUERY).matches
}

/**
 * True when the viewport is at least 1024 px wide. Only the layout switches;
 * all story state lives above the chapter views, so resizing keeps it.
 */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
