import { createContext, memo, useCallback, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { chatApi, invitationApi } from '../api/endpoints'
import { ApiError } from '../api/http'
import type { ImageInfo, PlanInfo } from '../api/types'
import { ACCEPTED_IMAGES, MAX_IMAGE_BYTES } from './limits'
import { applyInvitation } from './plans'
import { useChat } from './useChat'

/**
 * Chapter 08 session shared by the mobile and desktop layouts: the real useChat()
 * connection (STOMP, presence, typing, read receipts, history paging, retries) plus
 * the drafts (text, picked image, note). It lives in StoryLayout while chapter 08 is
 * open, so switching layouts neither reconnects nor loses what was being written.
 */


export type ChatErr = { kind: 'type' | 'size' | 'upload'; message?: string }
type Pending = { info: ImageInfo; preview: string }

export type ChatSessionValue = {
  chat: ReturnType<typeof useChat>
  text: string
  setText: Dispatch<SetStateAction<string>>
  showEmoji: boolean
  setShowEmoji: Dispatch<SetStateAction<boolean>>
  noteOpen: boolean
  setNoteOpen: Dispatch<SetStateAction<boolean>>
  note: string
  setNote: Dispatch<SetStateAction<string>>
  pending: Pending | null
  clearPending: () => void
  uploading: boolean
  err: ChatErr | null
  canSend: boolean
  /** Validates and uploads a picked image (JPEG/PNG/WebP, ≤ 10 MB). */
  pickFile: (file: File) => Promise<void>
  /** Sends the text (or the picked image with the text as caption). Returns false if nothing was sent. */
  sendNow: () => boolean
  sendNote: () => boolean
  /** Agrees to the plan of a PLAN card (invitationApi.agree) and updates the cards in place. */
  agreePlan: (plan: PlanInfo) => Promise<void>
  /** Proposal id currently being agreed to. */
  planBusy: number | null
  planError: { proposalId: number; message?: string } | null
}

const Ctx = createContext<ChatSessionValue | null>(null)

export function ChatSession({ enabled, myId, children }: { enabled: boolean; myId: number | undefined; children: ReactNode }) {
  const [value, setValue] = useState<ChatSessionValue | null>(null)
  return (
    <Ctx.Provider value={enabled ? value : null}>
      {enabled && myId !== undefined && <Live myId={myId} onValue={setValue} />}
      {children}
    </Ctx.Provider>
  )
}

const Live = memo(function Live({ myId, onValue }: { myId: number; onValue: (v: ChatSessionValue | null) => void }) {
  const chat = useChat({ myId, active: true })
  const [text, setText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState('')
  const [pending, setPending] = useState<Pending | null>(null)
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState<ChatErr | null>(null)
  const [planBusy, setPlanBusy] = useState<number | null>(null)
  const [planError, setPlanError] = useState<{ proposalId: number; message?: string } | null>(null)

  useEffect(() => () => {
    if (pending) URL.revokeObjectURL(pending.preview)
  }, [pending])

  const canSend = (!!text.trim() || !!pending) && !uploading
  const { send, notifyTyping, patchMessages } = chat

  const sendNow = useCallback(() => {
    if (!canSend) return false
    const body = text.trim()
    if (pending) {
      send('IMAGE', body || null, pending.info)
      setPending(null)
    } else {
      send('TEXT', body)
    }
    setText('')
    setShowEmoji(false)
    notifyTyping(false)
    return true
  }, [canSend, text, pending, send, notifyTyping])

  const sendNote = useCallback(() => {
    const body = note.trim()
    if (!body) return false
    send('NOTE', body)
    setNote('')
    setNoteOpen(false)
    return true
  }, [note, send])

  const pickFile = useCallback(async (file: File) => {
    if (!ACCEPTED_IMAGES.includes(file.type)) {
      setErr({ kind: 'type' })
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErr({ kind: 'size' })
      return
    }
    setErr(null)
    setUploading(true)
    try {
      const info = await chatApi.uploadImage(file)
      setPending({ info, preview: URL.createObjectURL(file) })
    } catch (ex) {
      setErr({ kind: 'upload', message: ex instanceof ApiError ? ex.message : undefined })
    } finally {
      setUploading(false)
    }
  }, [])

  const clearPending = useCallback(() => setPending(null), [])

  const agreePlan = useCallback(async (plan: PlanInfo) => {
    setPlanBusy(plan.proposalId)
    setPlanError(null)
    try {
      const inv = await invitationApi.agree(plan.invitationId, plan.proposalId)
      patchMessages((list) => applyInvitation(list, inv))
    } catch (ex) {
      setPlanError({ proposalId: plan.proposalId, message: ex instanceof ApiError ? ex.message : undefined })
      // e.g. 409 "already confirmed": bring the cards up to date with the server.
      invitationApi
        .list()
        .then((all) => {
          const inv = all.find((i) => i.id === plan.invitationId)
          if (inv) patchMessages((list) => applyInvitation(list, inv))
        })
        .catch(() => undefined)
    } finally {
      setPlanBusy(null)
    }
  }, [patchMessages])

  const value = useMemo<ChatSessionValue>(
    () => ({ chat, text, setText, showEmoji, setShowEmoji, noteOpen, setNoteOpen, note, setNote, pending, clearPending, uploading, err, canSend, pickFile, sendNow, sendNote, agreePlan, planBusy, planError }),
    [chat, text, showEmoji, noteOpen, note, pending, clearPending, uploading, err, canSend, pickFile, sendNow, sendNote, agreePlan, planBusy, planError],
  )
  useEffect(() => onValue(value), [value, onValue])
  useEffect(() => () => onValue(null), [onValue])
  return null
})

// eslint-disable-next-line react-refresh/only-export-components
export function useChatSession(): ChatSessionValue | null {
  return useContext(Ctx)
}
