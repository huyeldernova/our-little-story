import type { Invitation, PlanInfo } from '../api/types'
import type { UiMessage } from './useChat'

/**
 * PLAN cards always show the proposal's latest state. The server sends the current state
 * with every PLAN message, so when a newer card (or an agree response) arrives, the older
 * cards for the same proposal are updated in place.
 */

/** Copies the agreement state of `plan` onto every card of the same proposal. */
export function propagatePlan(list: UiMessage[], plan: PlanInfo): UiMessage[] {
  let changed = false
  const next = list.map((m) => {
    if (!m.plan || m.plan.proposalId !== plan.proposalId) return m
    const p = m.plan
    if (p.inviterAgreed === plan.inviterAgreed && p.inviteeAgreed === plan.inviteeAgreed && p.confirmed === plan.confirmed) return m
    changed = true
    return { ...m, plan: { ...p, inviterAgreed: plan.inviterAgreed, inviteeAgreed: plan.inviteeAgreed, confirmed: plan.confirmed } }
  })
  return changed ? next : list
}

/** Updates every card of an invitation from a fresh InvitationDto (e.g. the agree response). */
export function applyInvitation(list: UiMessage[], inv: Invitation): UiMessage[] {
  let changed = false
  const next = list.map((m) => {
    if (!m.plan || m.plan.invitationId !== inv.id) return m
    const p = inv.proposals.find((x) => x.id === m.plan!.proposalId)
    if (!p) return m
    const confirmed = inv.confirmedProposalId === p.id
    if (m.plan.inviterAgreed === p.inviterAgreed && m.plan.inviteeAgreed === p.inviteeAgreed && m.plan.confirmed === confirmed) return m
    changed = true
    return { ...m, plan: { ...m.plan, inviterAgreed: p.inviterAgreed, inviteeAgreed: p.inviteeAgreed, confirmed } }
  })
  return changed ? next : list
}

/** True when some card of this invitation is confirmed (then no other card can be agreed to). */
export function invitationConfirmed(list: UiMessage[], invitationId: number): boolean {
  return list.some((m) => m.plan?.invitationId === invitationId && m.plan.confirmed)
}

export function agreedBy(plan: PlanInfo, userId: number): boolean {
  return plan.inviterId === userId ? plan.inviterAgreed : plan.inviteeId === userId ? plan.inviteeAgreed : false
}
