import { createContext, memo, useCallback, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { invitationApi } from '../../api/endpoints'
import { ApiError } from '../../api/http'
import type { Invitation, TimeSlot } from '../../api/types'

/**
 * Chapter 07 state and backend flow, shared by the mobile and desktop layouts
 * (moved unchanged out of InvitationChapter so resizing keeps the card, the
 * form and the last suggestion):
 * - the invitee answers ACCEPTED / THINKING (POST /api/invitations/{id}/response);
 * - either person can suggest a plan (POST .../proposals) and agree to one
 *   (POST .../proposals/{pid}/agree). The ticket is only "written" once BOTH
 *   people agreed to the SAME proposal; accepting the card schedules nothing.
 * Polls every 15 s and on window focus while chapter 07 is open.
 */

export type InvError = { kind: 'load' | 'action' | 'missing'; message?: string }
export type ProposalDraft = { act: string; day: string; slot: TimeSlot; time: string; place: string; note: string }

export type InvitationSessionValue = {
  inv: Invitation | null
  loaded: boolean
  busy: boolean
  error: InvError | null
  showCard: boolean
  setShowCard: Dispatch<SetStateAction<boolean>>
  editing: boolean
  setEditing: Dispatch<SetStateAction<boolean>>
  act: string | null
  setAct: Dispatch<SetStateAction<string | null>>
  day: string | null
  setDay: Dispatch<SetStateAction<string | null>>
  slot: TimeSlot | null
  setSlot: Dispatch<SetStateAction<TimeSlot | null>>
  time: string
  setTime: Dispatch<SetStateAction<string>>
  place: string
  setPlace: Dispatch<SetStateAction<string>>
  note: string
  setNote: Dispatch<SetStateAction<string>>
  /** The suggestion this person sent last (shown in the "recorded" note). */
  lastSent: ProposalDraft | null
  /** The next 14 days, fixed for the session. */
  days: Date[]
  accept: () => Promise<void>
  later: () => Promise<void>
  agree: (proposalId: number) => Promise<void>
  sendProposal: () => Promise<void>
}

const Ctx = createContext<InvitationSessionValue | null>(null)

/** Provides the invitation session while `enabled` (chapter 07 open); children are never remounted. */
export function InvitationSession({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const [value, setValue] = useState<InvitationSessionValue | null>(null)
  return (
    <Ctx.Provider value={enabled ? value : null}>
      {enabled && <Live onValue={setValue} />}
      {children}
    </Ctx.Provider>
  )
}

const Live = memo(function Live({ onValue }: { onValue: (v: InvitationSessionValue | null) => void }) {
  const [inv, setInv] = useState<Invitation | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<InvError | null>(null)
  const [showCard, setShowCard] = useState(false)
  const [editing, setEditing] = useState(true)
  const [act, setAct] = useState<string | null>(null)
  const [day, setDay] = useState<string | null>(null)
  const [slot, setSlot] = useState<TimeSlot | null>(null)
  const [time, setTime] = useState('')
  const [place, setPlace] = useState('')
  const [note, setNote] = useState('')
  const [lastSent, setLastSent] = useState<ProposalDraft | null>(null)
  const [days] = useState(() => {
    const base = new Date()
    return Array.from({ length: 14 }, (_, i) => new Date(base.getFullYear(), base.getMonth(), base.getDate() + i + 1))
  })

  const refresh = useCallback(async () => {
    try {
      const list = await invitationApi.list()
      setInv(list[0] ?? null)
    } catch (e) {
      setError({ kind: 'load', message: e instanceof ApiError ? e.message : undefined })
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const id = window.setInterval(() => void refresh(), 15000)
    const onFocus = () => void refresh()
    window.addEventListener('focus', onFocus)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('focus', onFocus)
    }
  }, [refresh])

  const run = useCallback(async (fn: () => Promise<Invitation>) => {
    setBusy(true)
    setError(null)
    try {
      setInv(await fn())
      return true
    } catch (e) {
      setError({ kind: 'action', message: e instanceof ApiError ? e.message : undefined })
      return false
    } finally {
      setBusy(false)
    }
  }, [])

  const id = inv?.id
  const accept = useCallback(async () => {
    if (id !== undefined && (await run(() => invitationApi.respond(id, 'ACCEPTED')))) setShowCard(false)
  }, [id, run])
  const later = useCallback(async () => {
    if (id !== undefined && (await run(() => invitationApi.respond(id, 'THINKING')))) setShowCard(false)
  }, [id, run])
  const agree = useCallback(async (pid: number) => {
    if (id !== undefined) await run(() => invitationApi.agree(id, pid))
  }, [id, run])

  const sendProposal = useCallback(async () => {
    if (id === undefined) return
    if (!act || !day || !slot) {
      setError({ kind: 'missing' })
      return
    }
    const ok = await run(() =>
      invitationApi.propose(id, {
        proposedDate: day,
        timeSlot: slot,
        specificTime: time || null,
        activity: act,
        location: place.trim() || null,
        note: note.trim() || null,
      }),
    )
    if (ok) {
      setLastSent({ act, day, slot, time, place: place.trim(), note: note.trim() })
      setEditing(false)
      setAct(null)
      setDay(null)
      setSlot(null)
      setTime('')
      setPlace('')
      setNote('')
    }
  }, [id, act, day, slot, time, place, note, run])

  const value = useMemo<InvitationSessionValue>(
    () => ({
      inv, loaded, busy, error, showCard, setShowCard, editing, setEditing,
      act, setAct, day, setDay, slot, setSlot, time, setTime, place, setPlace, note, setNote,
      lastSent, days, accept, later, agree, sendProposal,
    }),
    [inv, loaded, busy, error, showCard, editing, act, day, slot, time, place, note, lastSent, days, accept, later, agree, sendProposal],
  )
  useEffect(() => onValue(value), [value, onValue])
  useEffect(() => () => onValue(null), [onValue])
  return null
})

// eslint-disable-next-line react-refresh/only-export-components
export function useInvitation(): InvitationSessionValue | null {
  return useContext(Ctx)
}

/** Which view of the design to show (same rules for both layouts). */
// eslint-disable-next-line react-refresh/only-export-components
export function invitationView(s: InvitationSessionValue): 'none' | 'invite' | 'later' | 'ticket' {
  const inv = s.inv
  if (!inv) return 'none'
  if (s.showCard) return 'invite'
  if (inv.status === 'ACCEPTED') return 'ticket'
  if (inv.status === 'THINKING') return 'later'
  return 'invite'
}
