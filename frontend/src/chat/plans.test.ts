import { describe, expect, it } from 'vitest'
import type { Invitation, PlanInfo } from '../api/types'
import { agreedBy, applyInvitation, invitationConfirmed, propagatePlan } from './plans'
import type { UiMessage } from './useChat'

const plan = (proposalId: number, over: Partial<PlanInfo> = {}): PlanInfo => ({
  invitationId: 1, proposalId, activity: 'A', proposedDate: '2026-12-01', timeSlot: 'EVENING', specificTime: null,
  location: null, note: null, proposerName: 'P', inviterId: 10, inviteeId: 20,
  inviterAgreed: false, inviteeAgreed: true, confirmed: false, ...over,
})
const msg = (id: number, p: PlanInfo | null): UiMessage => ({
  id, conversationId: 1, senderId: 20, senderName: '', type: p ? 'PLAN' : 'TEXT', content: p ? null : 'x',
  image: null, clientMessageId: 'c' + id, createdAt: new Date(0).toISOString(), status: 'sent', plan: p,
})

describe('plan cards', () => {
  it('a newer card updates older cards of the same proposal only', () => {
    const list = [msg(1, plan(7)), msg(2, null), msg(3, plan(8))]
    const next = propagatePlan(list, plan(7, { inviterAgreed: true, confirmed: true }))
    expect(next[0].plan?.confirmed).toBe(true)
    expect(next[0].plan?.inviterAgreed).toBe(true)
    expect(next[2].plan?.confirmed).toBe(false)
    expect(next[1]).toBe(list[1])
  })

  it('returns the same list when nothing changed (no extra render)', () => {
    const list = [msg(1, plan(7))]
    expect(propagatePlan(list, plan(7))).toBe(list)
  })

  it('applies an agree response to every card of the invitation', () => {
    const list = [msg(1, plan(7)), msg(3, plan(8))]
    const inv = {
      id: 1, confirmedProposalId: 7,
      proposals: [
        { id: 7, inviterAgreed: true, inviteeAgreed: true },
        { id: 8, inviterAgreed: false, inviteeAgreed: true },
      ],
    } as unknown as Invitation
    const next = applyInvitation(list, inv)
    expect(next[0].plan?.confirmed).toBe(true)
    expect(next[1].plan?.confirmed).toBe(false)
    expect(invitationConfirmed(next, 1)).toBe(true)
    expect(invitationConfirmed(list, 1)).toBe(false)
  })

  it('knows which side has agreed', () => {
    expect(agreedBy(plan(7), 20)).toBe(true)
    expect(agreedBy(plan(7), 10)).toBe(false)
    expect(agreedBy(plan(7), 99)).toBe(false)
  })
})
