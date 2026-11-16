import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { storyApi } from '../api/endpoints'
import { apiUrl } from '../api/http'

/**
 * Story content (texts, captions, photo file names) is NOT part of the frontend
 * bundle: it is loaded after login from GET /api/story, which reads story.json
 * from a private directory on the server. The public repo only ships a
 * placeholder story (story-example/). See docs/STORY_CONTENT.md.
 */
export type LightboxPhoto = { asset: string; label: string; caption: string; pos?: string }

export type Story = {
  version: number
  music?: { youtubeVideoId?: string; title?: string }
  chapterTitles: string[]
  texts: Record<string, string>
  lightbox: LightboxPhoto[]
  avatars?: Record<string, string>
  letter?: Partial<Record<'subSealed' | 'subPeek' | 'subOut' | 'holdIdle' | 'holdActive', string>>
  invite?: { activities?: string[] }
}

type StoryState = {
  story: Story | null
  error: string | null
  t: (key: string) => string
  asset: (file: string) => string
}

const StoryContext = createContext<StoryState | null>(null)

export function assetUrl(file: string): string {
  return apiUrl(`/api/story/assets/${encodeURIComponent(file)}`)
}

export function StoryProvider({ children }: { children: ReactNode }) {
  const [story, setStory] = useState<Story | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    storyApi
      .load()
      .then((s) => {
        if (!alive) return
        const data = s as Story
        if (!data || typeof data !== 'object' || !data.texts) throw new Error('story.json has no "texts"')
        setStory(data)
      })
      .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : String(e)))
    return () => {
      alive = false
    }
  }, [])

  const value = useMemo<StoryState>(
    () => ({
      story,
      error,
      t: (key: string) => story?.texts[key] ?? `⟨${key}⟩`,
      asset: assetUrl,
    }),
    [story, error],
  )
  return <StoryContext.Provider value={value}>{children}</StoryContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStory(): StoryState {
  const ctx = useContext(StoryContext)
  if (!ctx) throw new Error('useStory must be used inside <StoryProvider>')
  return ctx
}
