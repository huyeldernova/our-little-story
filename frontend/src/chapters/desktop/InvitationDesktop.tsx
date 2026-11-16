import type { CSSProperties } from 'react'
import type { Proposal, TimeSlot } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'
import { fill, parts } from '../../story/fill'
import { useStory } from '../../story/StoryContext'
import { invitationView, useInvitation, type InvitationSessionValue } from '../invitation/InvitationSession'
import type { ChapterProps } from '../types'

const hand = "'Patrick Hand', cursive"
const serif = "'Cormorant Garamond', serif"
const SLOT_IDS: TimeSlot[] = ['MORNING', 'AFTERNOON', 'EVENING']
const pad = (n: number) => String(n).padStart(2, '0')
const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const label10: CSSProperties = { fontSize: 10, letterSpacing: '.26em', color: '#6B6158' }
const pill = (sel: boolean): CSSProperties => ({
  minHeight: 44, padding: '0 16px', border: `1px solid ${sel ? '#39342F' : '#CDBBA3'}`, borderRadius: 999,
  background: sel ? '#39342F' : 'transparent', color: sel ? '#FAF7F0' : '#39342F', fontFamily: hand, fontSize: 18, cursor: 'pointer',
})
const input: CSSProperties = {
  minHeight: 46, padding: '0 14px', border: '1px solid #CDBBA3', borderRadius: 2, background: '#FFFFFF',
  fontFamily: hand, fontSize: 19, letterSpacing: 0, color: '#39342F',
}
const darkBtn: CSSProperties = { minHeight: 50, padding: '0 28px', background: '#39342F', color: '#FAF7F0', border: 0, borderRadius: 2, fontFamily: hand, fontSize: 20, cursor: 'pointer' }
const ghostBtn: CSSProperties = { minHeight: 48, padding: '0 20px', background: 'transparent', border: '1px solid #CDBBA3', borderRadius: 2, color: '#39342F', fontFamily: hand, fontSize: 19, cursor: 'pointer' }
const note: CSSProperties = { background: '#FAF7F0', transform: 'rotate(-1deg)', boxShadow: '0 24px 44px -24px rgba(57,52,47,.45)' }

/**
 * Chapter 07, desktop layout (Invite.dc.html). Only the layout differs from mobile: the
 * card, the answers, the suggestions and the "both agreed" rule all come from the shared
 * InvitationSession (invitationApi). The ticket is written only when both people agreed
 * to the same suggestion.
 */
export default function InvitationDesktop(props: ChapterProps) {
  const s = useInvitation()
  return (
    <div style={{ position: 'relative', minHeight: 900, background: '#F3EBDD', overflow: 'clip' }}>
      <div aria-hidden="true" style={{ position: 'absolute', left: '8%', top: 230, width: 220, height: 280, background: '#E6D8C5', transform: 'rotate(-8deg)' }} />
      <div aria-hidden="true" style={{ position: 'absolute', right: '9%', top: 820, width: 260, height: 200, background: '#E6D8C5', transform: 'rotate(6deg)' }} />
      {s && <Invitation {...props} s={s} />}
    </div>
  )
}

function Invitation({ go, s }: ChapterProps & { s: InvitationSessionValue }) {
  const { t, story } = useStory()
  const { user } = useAuth()
  const me = user!
  const { inv, loaded, busy } = s
  const DOW = parts(t('d07.022'))
  const SLOT = parts(t('d07.021'))
  const slotLabel = (id: TimeSlot) => SLOT[SLOT_IDS.indexOf(id)] ?? id
  const dayLabel = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number)
    const dt = new Date(y, m - 1, d)
    return `${DOW[dt.getDay()]}, ${dt.getDate()}/${dt.getMonth() + 1}`
  }
  const whenLabel = (p: Proposal) => `${dayLabel(p.proposedDate)} · ${slotLabel(p.timeSlot)}${p.specificTime ? ' ' + p.specificTime.slice(0, 5) : ''}`

  const error = !s.error ? '' : s.error.message ?? t(s.error.kind === 'load' ? 'd07.024' : s.error.kind === 'missing' ? 'd07.026' : 'd07.025')
  const isInvitee = !!inv && inv.invitee.id === me.id
  const partnerName = inv ? (isInvitee ? inv.inviter : inv.invitee).displayName : ''
  const confirmed = inv?.proposals.find((p) => p.id === inv.confirmedProposalId) ?? null
  const activities = story?.invite?.activities ?? []
  const view = invitationView(s)
  const ls = s.lastSent
  const summary = ls
    ? `${fill(t('d07.023'), { name: me.displayName })} ` + [ls.act, dayLabel(ls.day), slotLabel(ls.slot) + (ls.time ? ' ' + ls.time : ''), ls.place, ls.note].filter(Boolean).join(' · ')
    : ''
  const errorLine = error ? <span role="alert" style={{ fontFamily: hand, fontSize: 17, color: '#A8655A' }}>{error}</span> : null

  return (
    <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', padding: '90px 40px 110px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize: 11, letterSpacing: '.3em', color: '#525B50', textAlign: 'center' }}>{t('c07.001')}</span>
      <span style={{ marginTop: 8, fontFamily: hand, fontSize: 19, color: '#9B7663', textAlign: 'center' }}>{t('c07.002')}</span>

      {loaded && !inv && <p style={{ marginTop: 60, fontFamily: hand, fontSize: 22, color: '#525B50', textAlign: 'center' }}>{error || t('d07.004')}</p>}

      {view === 'invite' && inv && (
        <div className="d-card-in" style={{ position: 'relative', marginTop: 34, width: '100%', maxWidth: 720, background: '#FAF7F0', padding: 14, boxSizing: 'border-box', transform: 'rotate(-.6deg)', boxShadow: '0 2px 3px rgba(57,52,47,.12), 0 44px 80px -36px rgba(57,52,47,.5)' }}>
          <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: -15, width: 130, height: 30, marginLeft: -65, background: 'rgba(199,143,145,.55)', transform: 'rotate(-3deg)' }} />
          <div style={{ border: '1px solid #CDBBA3', outline: '1px solid #E6D8C5', outlineOffset: -7, padding: '56px 64px 48px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}>
            <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: 34, color: '#9B7663' }}>{t('c07.003')}</span>
            <h2 style={{ margin: 0, fontFamily: serif, fontWeight: 500, fontSize: 60, lineHeight: 1.04 }}>
              {t('c07.004')} <em style={{ fontWeight: 400 }}>{t('c07.005')}</em>
            </h2>
            <div style={{ width: 60, height: 1, background: '#CDBBA3' }} />
            <p style={{ margin: 0, maxWidth: 500, fontFamily: serif, fontSize: 22, lineHeight: 1.55, color: '#39342F' }}>{t('c07.006')}</p>
            <p style={{ margin: 0, maxWidth: 500, fontFamily: serif, fontSize: 22, lineHeight: 1.55, color: '#4A443D' }}>{t('c07.007')}</p>
            <span style={{ alignSelf: 'flex-end', fontFamily: "'Dancing Script', cursive", fontSize: 30, color: '#9B7663' }}>{t('c07.008')}</span>
            {isInvitee ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 10 }}>
                <button className="d-btn" type="button" disabled={busy} onClick={() => void s.accept()} style={{ minHeight: 50, padding: '0 30px', background: '#39342F', color: '#FAF7F0', border: 0, borderRadius: 2, fontSize: 12, letterSpacing: '.2em', cursor: 'pointer' }}>{t('c07.009')}</button>
                <button className="d-ghost-light" type="button" disabled={busy} onClick={() => void s.later()} style={{ minHeight: 50, padding: '0 24px', background: 'transparent', color: '#39342F', border: '1px solid #CDBBA3', borderRadius: 2, fontSize: 12, letterSpacing: '.16em', cursor: 'pointer' }}>{t('c07.010')}</button>
              </div>
            ) : (
              <p style={{ margin: '10px 0 0', fontFamily: hand, fontSize: 20, color: '#525B50' }}>
                {fill(t(inv.status === 'PENDING' ? 'd07.005' : inv.status === 'THINKING' ? 'd07.006' : 'd07.007'), { name: partnerName })}
              </p>
            )}
            {s.showCard && inv.status !== 'PENDING' && (
              <button className="d-ghost-light" type="button" onClick={() => s.setShowCard(false)} style={{ ...ghostBtn, minHeight: 44, fontSize: 18 }}>{t('d07.008')}</button>
            )}
            {errorLine}
          </div>
        </div>
      )}

      {view === 'later' && (
        <div className="d-fade-up" style={{ marginTop: 60, maxWidth: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, textAlign: 'center' }}>
          <div style={{ ...note, padding: '32px 36px' }}>
            <p style={{ margin: 0, fontFamily: hand, fontSize: 26, lineHeight: 1.45, color: '#525B50' }}>{isInvitee ? t('c07.011') : fill(t('d07.009'), { name: partnerName })}</p>
          </div>
          <button className="d-ghost-light" type="button" onClick={() => s.setShowCard(true)} style={{ ...ghostBtn, minHeight: 46 }}>{t('c07.012')}</button>
        </div>
      )}

      {view === 'ticket' && inv && (
        <div style={{ position: 'relative', marginTop: 34, width: '100%', maxWidth: 720 }}>
          <div className="d-card-away" aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 440, background: '#FAF7F0', border: '1px solid #CDBBA3', boxShadow: '0 30px 60px -30px rgba(57,52,47,.5)', zIndex: 3 }} />
          <div className="d-ticket-in" role="group" aria-label={t('c07.013')} style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', background: '#2E2A26', padding: '12px 0', transform: 'rotate(-1deg)', boxShadow: '0 40px 70px -32px rgba(57,52,47,.65)' }}>
            <div className="d-holes-light" aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: 0 }} />
            <div className="d-holes-light" aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }} />
            <div style={{ flex: '1 1 420px', minWidth: 0, margin: '10px 0 10px 14px', background: '#FAF7F0', padding: '30px 34px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontSize: 10, letterSpacing: '.32em', color: '#9B7663' }}>{t('c07.014')}</span>
                <span style={{ fontSize: 10, letterSpacing: '.26em', color: '#6B6158', textTransform: 'uppercase' }}>{t('c01.009')}</span>
              </div>
              <span style={{ fontFamily: serif, fontSize: 46, lineHeight: 1, fontWeight: 500 }}>{t('c07.016')}</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px 24px', borderTop: '1px dashed #CDBBA3', paddingTop: 16 }}>
                <Field label={t('c07.017')} value={t('c07.018')} />
                <Field label={t('c07.019')} value={confirmed ? confirmed.activity : t('c07.016')} />
                <Field label={t('c07.020')} value={confirmed ? whenLabel(confirmed) : t('c07.021')} />
                <Field label={t('c07.022')} value={confirmed?.location || t('c07.021')} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: 9, letterSpacing: '.26em', color: '#6B6158' }}>{t('c07.023')}</span>
                <span style={{ fontFamily: hand, fontSize: 22, color: confirmed ? '#525B50' : '#A8655A' }}>{confirmed ? t('d07.010') : t('c07.024')}</span>
              </div>
            </div>
            <div style={{ flex: '0 0 170px', margin: '10px 14px 10px 0', background: '#E6D8C5', borderLeft: '2px dashed #FAF7F0', padding: '24px 18px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center' }}>
              <span style={{ fontSize: 9, letterSpacing: '.28em', color: '#525B50' }}>{t('d07.001')}</span>
              <span style={{ fontFamily: serif, fontSize: 54, lineHeight: 1, color: '#39342F' }}>03</span>
              <span style={{ fontFamily: hand, fontSize: 17, lineHeight: 1.2, color: '#525B50' }}>{t('d07.002')}</span>
            </div>
          </div>

          <div className="d-fade-up2" style={{ marginTop: 50, display: 'flex', flexDirection: 'column', gap: 34 }}>
            {inv.proposals.length > 0 && (
              <section aria-label={t('d07.027')} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <span style={label10}>{t('d07.011')}</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                  {inv.proposals.map((p, i) => {
                    const otherAgreed = isInvitee ? p.inviterAgreed : p.inviteeAgreed
                    return (
                      <div key={p.id} style={{ background: p.confirmed ? '#FAF7F0' : '#FFFFFF', border: p.confirmed ? '2px solid #525B50' : '1px solid #E6D8C5', padding: '18px 20px 16px', transform: `rotate(${i % 2 ? 0.6 : -0.6}deg)`, display: 'flex', flexDirection: 'column', gap: 8, boxShadow: '0 14px 26px -18px rgba(57,52,47,.45)' }}>
                        <span style={{ fontFamily: serif, fontSize: 24, fontWeight: 500 }}>{p.activity}</span>
                        <span style={{ fontFamily: hand, fontSize: 18, color: '#525B50' }}>{whenLabel(p)}{p.location ? ' · ' + p.location : ''}</span>
                        {p.note && <span style={{ fontFamily: hand, fontSize: 17, color: '#6B6158' }}>“{p.note}”</span>}
                        <span style={{ fontSize: 12, color: '#6B6158' }}>{fill(t('d07.012'), { name: p.proposerName })}</span>
                        {p.confirmed ? (
                          <span style={{ fontFamily: hand, fontSize: 19, color: '#525B50' }}>{t('d07.013')}</span>
                        ) : p.agreedByMe ? (
                          <span style={{ fontFamily: hand, fontSize: 18, color: '#9B7663' }}>{otherAgreed ? t('d07.013') : fill(t('d07.014'), { name: partnerName })}</span>
                        ) : !inv.confirmedProposalId ? (
                          <button className="d-btn" type="button" disabled={busy} onClick={() => void s.agree(p.id)} style={{ ...darkBtn, minHeight: 44, fontSize: 18, alignSelf: 'flex-start' }}>{t('d07.015')}</button>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {confirmed ? (
              <div className="d-fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center' }}>
                <div style={{ ...note, padding: '28px 34px' }}>
                  <span style={{ fontFamily: serif, fontSize: 30 }}>{t('d07.016')}</span>
                </div>
                <button className="d-btn" type="button" onClick={() => go(7)} style={darkBtn}>{t('c07.036')}</button>
              </div>
            ) : s.editing ? (
              <div style={{ background: '#FAF7F0', padding: '34px 36px 30px', boxSizing: 'border-box', transform: 'rotate(.4deg)', boxShadow: '0 24px 44px -26px rgba(57,52,47,.45)', display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontFamily: serif, fontSize: 30 }}>{isInvitee ? t('c07.025') : t('d07.017')}</span>
                  <span style={{ fontFamily: hand, fontSize: 18, color: '#525B50' }}>{t('c07.026')}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span style={label10}>{t('c07.027')}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {activities.map((a) => (
                      <button key={a} className="d-chip" type="button" onClick={() => s.setAct(s.act === a ? null : a)} aria-pressed={s.act === a} style={pill(s.act === a)}>{a}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span style={label10}>{t('c07.028')}</span>
                  <div role="group" aria-label={t('d07.003')} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6 }}>
                    {s.days.map((dt) => {
                      const key = isoDay(dt)
                      const sel = s.day === key
                      return (
                        <button key={key} className="d-chip" type="button" onClick={() => s.setDay(sel ? null : key)} aria-pressed={sel} aria-label={dayLabel(key)} style={{ minHeight: 58, padding: '6px 2px', border: '1px solid #E6D8C5', borderRadius: 2, background: sel ? '#39342F' : '#FAF7F0', color: sel ? '#FAF7F0' : '#39342F', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontFamily: 'Inter, sans-serif' }}>
                          <span style={{ fontSize: 10, letterSpacing: '.1em' }}>{DOW[dt.getDay()]}</span>
                          <span style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, lineHeight: 1 }}>{dt.getDate()}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span style={label10}>{t('c07.029')}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {SLOT_IDS.map((id) => (
                      <button key={id} className="d-chip" type="button" onClick={() => s.setSlot(s.slot === id ? null : id)} aria-pressed={s.slot === id} style={pill(s.slot === id)}>{slotLabel(id)}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: 16 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 8, ...label10 }}>
                    {t('d07.018')}
                    <input type="time" value={s.time} onChange={(e) => s.setTime(e.target.value)} style={input} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 8, ...label10 }}>
                    {t('d07.019')}
                    <input type="text" maxLength={200} value={s.place} onChange={(e) => s.setPlace(e.target.value)} style={input} />
                  </label>
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 8, ...label10 }}>
                  {t('c07.030')}
                  <input type="text" maxLength={500} value={s.note} onChange={(e) => s.setNote(e.target.value)} placeholder={t('c07.031')} style={input} />
                </label>
                {errorLine}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <button className="d-ghost-light" type="button" onClick={() => s.setShowCard(true)} style={{ minHeight: 44, padding: '0 14px', background: 'transparent', border: 0, color: '#39342F', fontSize: 12, letterSpacing: '.16em', cursor: 'pointer' }}>{t('c07.033')}</button>
                  <button className="d-btn" type="button" disabled={busy} onClick={() => void s.sendProposal()} style={darkBtn}>
                    {isInvitee ? t('c07.032') : fill(t('d07.020'), { name: partnerName })}
                  </button>
                </div>
              </div>
            ) : (
              <div className="d-fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center' }}>
                <div style={{ ...note, padding: '28px 34px', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
                  <span style={{ fontFamily: serif, fontSize: 30 }}>{t('c07.034')}</span>
                  <span style={{ fontFamily: hand, fontSize: 20, color: '#525B50' }}>{summary}</span>
                  <span style={{ fontFamily: hand, fontSize: 20, lineHeight: 1.4, color: '#39342F' }}>{t('c07.035')}</span>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: hand, fontSize: 18, color: '#525B50' }}>
                  {t('d07.028')}
                  <button type="button" className="d-link" onClick={() => go(7)} style={{ minHeight: 40, padding: '0 4px', border: 0, borderBottom: '1px solid #9B7663', background: 'transparent', color: '#39342F', fontFamily: hand, fontSize: 18, cursor: 'pointer' }}>{t('d07.029')}</button>
                </span>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button className="d-btn" type="button" onClick={() => go(7)} style={{ ...darkBtn, minHeight: 48 }}>{t('c07.036')}</button>
                  <button className="d-ghost-light" type="button" onClick={() => s.setEditing(true)} style={ghostBtn}>{t('c07.037')}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
      <span style={{ fontSize: 9, letterSpacing: '.26em', color: '#6B6158' }}>{label}</span>
      <span style={{ fontFamily: serif, fontSize: 22, overflowWrap: 'anywhere' }}>{value}</span>
    </div>
  )
}
