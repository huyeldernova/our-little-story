import type { CSSProperties } from 'react'
import type { PlanInfo, TimeSlot } from '../api/types'
import { fill, parts } from '../story/fill'
import { agreedBy } from './plans'

const SLOT_IDS: TimeSlot[] = ['MORNING', 'AFTERNOON', 'EVENING']
const hand = "'Patrick Hand', cursive"
const serif = "'Cormorant Garamond', serif"

type Props = {
  plan: PlanInfo
  myId: number
  partnerName: string
  /** Some card of this invitation is already confirmed: no more agreeing. */
  invitationConfirmed: boolean
  busy: boolean
  error?: string
  onAgree: () => void
  /** Opens chapter 07. */
  onOpen: () => void
  t: (key: string) => string
  /** Desktop uses a slightly larger card. */
  wide?: boolean
  rotate?: string
}

/**
 * A small date-plan card in the chat (PLAN message), styled like the chapter 07 ticket:
 * dark frame with punched edges, cream paper, Cormorant + Patrick Hand. Shared by the
 * mobile and desktop chat. Clicking the card (outside the button) opens chapter 07.
 */
export default function PlanCard({ plan, myId, partnerName, invitationConfirmed, busy, error, onAgree, onOpen, t, wide, rotate = '-1deg' }: Props) {
  const DOW = parts(t('d07.022'))
  const SLOT = parts(t('d07.021'))
  const [y, m, d] = plan.proposedDate.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const when = `${DOW[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1} · ${SLOT[SLOT_IDS.indexOf(plan.timeSlot)] ?? plan.timeSlot}${plan.specificTime ? ' ' + plan.specificTime.slice(0, 5) : ''}`
  const mine = agreedBy(plan, myId)
  const holes: CSSProperties = { position: 'absolute', left: 0, right: 0, height: 8, backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 8px, #F3EBDD 8px 14px, transparent 14px 20px)' }
  const fs = wide ? 1 : 0.9

  return (
    <div style={{ position: 'relative', width: wide ? 340 : 260, maxWidth: wide ? '80%' : '86%', background: '#2E2A26', padding: '10px 8px', boxSizing: 'border-box', transform: `rotate(${rotate})`, boxShadow: '0 16px 28px -16px rgba(57,52,47,.6)' }}>
      <div aria-hidden="true" style={{ ...holes, top: 0 }} />
      <div aria-hidden="true" style={{ ...holes, bottom: 0 }} />
      {/* The whole card opens chapter 07; the agree button sits above this layer. */}
      <button type="button" onClick={onOpen} aria-label={t('d08.029')} style={{ position: 'absolute', inset: 0, zIndex: 1, border: 0, padding: 0, background: 'transparent', cursor: 'pointer' }} />
      <div style={{ position: 'relative', background: '#FAF7F0', padding: wide ? '16px 18px 14px' : '13px 14px 12px', display: 'flex', flexDirection: 'column', gap: 6, color: '#39342F', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 9, letterSpacing: '.26em', color: '#9B7663', textTransform: 'uppercase' }}>{t('c07.016')}</span>
          {plan.confirmed && <span aria-hidden="true" style={{ fontSize: 12, color: '#525B50' }}>✓</span>}
        </div>
        <span style={{ fontFamily: serif, fontSize: 24 * fs, lineHeight: 1.05, fontWeight: 500, overflowWrap: 'anywhere' }}>{plan.activity}</span>
        <span style={{ fontFamily: hand, fontSize: 17 * fs, color: '#525B50', borderTop: '1px dashed #CDBBA3', paddingTop: 6 }}>
          {when}
          {plan.location ? ` · ${plan.location}` : ''}
        </span>
        {plan.note && <span style={{ fontFamily: hand, fontSize: 16 * fs, color: '#6B6158', overflowWrap: 'anywhere' }}>“{plan.note}”</span>}
        <span style={{ fontSize: 11, color: '#6B6158' }}>{fill(t('d08.027'), { name: plan.proposerName })}</span>
        <div style={{ borderTop: '2px dashed #E6D8C5', paddingTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {plan.confirmed ? (
            <span style={{ fontFamily: hand, fontSize: 18 * fs, color: '#525B50' }}>{t('d07.010')}</span>
          ) : mine ? (
            <span style={{ fontFamily: hand, fontSize: 17 * fs, color: '#9B7663' }}>{fill(t('d07.014'), { name: partnerName })}</span>
          ) : !invitationConfirmed ? (
            <button type="button" className="tap" onClick={onAgree} disabled={busy} style={{ position: 'relative', zIndex: 2, pointerEvents: 'auto', minHeight: 40, padding: '0 16px', border: 0, borderRadius: 2, background: '#39342F', color: '#FAF7F0', opacity: busy ? 0.5 : 1, fontFamily: hand, fontSize: 17, cursor: 'pointer' }}>
              {t('d08.028')}
            </button>
          ) : null}
        </div>
        {error !== undefined && <span role="alert" style={{ fontFamily: hand, fontSize: 15, color: '#A8655A' }}>{error || t('d07.025')}</span>}
      </div>
    </div>
  )
}
