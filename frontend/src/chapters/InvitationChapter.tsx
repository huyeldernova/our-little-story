import type { CSSProperties } from 'react'
import type { Proposal, TimeSlot } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { useStory } from '../story/StoryContext'
import { invitationView, useInvitation } from './invitation/InvitationSession'
import type { ChapterProps } from './types'

/**
 * Chapter 07 (mobile layout) — the invitation card, wired to the backend through InvitationSession:
 * the invitee answers ACCEPTED / THINKING (POST /api/invitations/{id}/response);
 * either person can suggest a plan (POST .../proposals) and agree to one
 * (POST .../proposals/{pid}/agree). The ticket is only "written" once BOTH people
 * agreed to the SAME proposal — accepting the card does not schedule anything.
 */

const SLOTS: { id: TimeSlot; label: string }[] = [
  { id: 'MORNING', label: 'Buổi sáng' },
  { id: 'AFTERNOON', label: 'Buổi chiều' },
  { id: 'EVENING', label: 'Buổi tối' },
]
const DOW = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

const pad = (n: number) => String(n).padStart(2, '0')
const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
function dayLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return `${DOW[dt.getDay()]}, ${dt.getDate()}/${dt.getMonth() + 1}`
}
function whenLabel(p: Proposal): string {
  const slot = SLOTS.find((s) => s.id === p.timeSlot)?.label ?? p.timeSlot
  return `${dayLabel(p.proposedDate)} · ${slot}${p.specificTime ? ' ' + p.specificTime.slice(0, 5) : ''}`
}

const label9: CSSProperties = { fontSize: '9px', letterSpacing: '.24em', color: '#6B6158' }
const chip = (sel: boolean): CSSProperties => ({
  minHeight: '44px', padding: '0 14px', border: `1px solid ${sel ? '#39342F' : '#CDBBA3'}`, borderRadius: '999px',
  background: sel ? '#39342F' : 'transparent', color: sel ? '#FAF7F0' : '#39342F',
  fontFamily: "'Patrick Hand', cursive", fontSize: '16px', cursor: 'pointer',
})
const inputStyle: CSSProperties = {
  minHeight: '46px', padding: '0 12px', border: '1px solid #CDBBA3', borderRadius: '2px', background: '#FFFFFF',
  fontFamily: "'Patrick Hand', cursive", fontSize: '18px', letterSpacing: '0', color: '#39342F',
}
const darkBtn: CSSProperties = {
  minHeight: '50px', background: '#39342F', color: '#FAF7F0', border: '0', borderRadius: '2px',
  fontFamily: "'Patrick Hand', cursive", fontSize: '19px', cursor: 'pointer',
}
const lightBtn: CSSProperties = {
  minHeight: '44px', padding: '0 16px', background: 'transparent', border: '1px solid #CDBBA3', borderRadius: '2px',
  color: '#39342F', fontFamily: "'Patrick Hand', cursive", fontSize: '17px', cursor: 'pointer',
}
const hand = (size: number, color = '#39342F'): CSSProperties => ({ fontFamily: "'Patrick Hand', cursive", fontSize: `${size}px`, color })

export default function InvitationChapter({ turn, go }: ChapterProps) {
  const { t, story } = useStory()
  const { user } = useAuth()
  const s = useInvitation()
  const rootStyle: CSSProperties = { position: 'absolute', inset: '0', overflowY: 'auto', overflowX: 'hidden', background: '#F3EBDD', padding: '92px 16px 40px', boxSizing: 'border-box' }
  if (!s) return <div className={`pg ${turn}`} style={rootStyle} />

  // State and backend calls come from the shared InvitationSession (same flow as before).
  const { inv, loaded, busy, showCard, setShowCard, editing, setEditing, act, setAct, day, setDay, slot, setSlot, time, setTime, place, setPlace, note, setNote, days, accept, later, sendProposal } = s
  const error = !s.error
    ? ''
    : s.error.message ?? (s.error.kind === 'load' ? 'Không tải được lời mời.' : s.error.kind === 'missing' ? 'Chọn giúp một hoạt động, một ngày và một khoảng thời gian nhé.' : 'Có lỗi nhỏ, thử lại nhé.')

  const me = user!
  const isInvitee = !!inv && inv.invitee.id === me.id
  const partner = inv ? (isInvitee ? inv.inviter : inv.invitee) : null
  const confirmed = inv?.proposals.find((p) => p.id === inv.confirmedProposalId) ?? null
  const activities = story?.invite?.activities ?? []
  const ls = s.lastSent
  const lastSummary = ls
    ? `Gợi ý của ${me.displayName}: ` + [ls.act, dayLabel(ls.day), SLOTS.find((x) => x.id === ls.slot)?.label + (ls.time ? ' ' + ls.time : ''), ls.place, ls.note].filter(Boolean).join(' · ')
    : ''

  // Which view of the design to show.
  const view = invitationView(s)

  return (
    <div className={`pg ${turn}`} style={rootStyle}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '4px' }}>
        <span style={{ fontSize: '10px', letterSpacing: '.28em', color: '#525B50' }}>{t('c07.001')}</span>
        <span style={hand(16, '#9B7663')}>{t('c07.002')}</span>
      </div>

      {loaded && !inv && (
        <p style={{ ...hand(19, '#525B50'), marginTop: '40px', textAlign: 'center' }}>
          {error || 'Tấm thiệp này chưa được gửi.'}
        </p>
      )}

      {view === 'invite' && (
        <div className="m7cardIn" style={{ position: 'relative', marginTop: '24px', background: '#FAF7F0', padding: '9px', transform: 'rotate(-.5deg)', boxShadow: '0 30px 50px -26px rgba(57,52,47,.5)' }}>
          <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '-11px', width: '96px', height: '22px', marginLeft: '-48px', background: 'rgba(199,143,145,.55)', transform: 'rotate(-3deg)' }}></div>
          <div style={{ border: '1px solid #CDBBA3', outline: '1px solid #E6D8C5', outlineOffset: '-6px', padding: '32px 20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px' }}>
            <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: '28px', color: '#9B7663' }}>{t('c07.003')}</span>
            <h2 style={{ margin: '0', fontFamily: "'Cormorant Garamond', serif", fontWeight: '500', fontSize: '40px', lineHeight: '1.04' }}>
              {t('c07.004')} <em style={{ fontWeight: '400' }}>{t('c07.005')}</em>
            </h2>
            <div style={{ width: '44px', height: '1px', background: '#CDBBA3' }}></div>
            <p style={{ margin: '0', fontFamily: "'Cormorant Garamond', serif", fontSize: '19px', lineHeight: '1.5' }}>{t('c07.006')}</p>
            <p style={{ margin: '0', fontFamily: "'Cormorant Garamond', serif", fontSize: '19px', lineHeight: '1.5', color: '#4A443D' }}>{t('c07.007')}</p>
            <span style={{ alignSelf: 'flex-end', fontFamily: "'Dancing Script', cursive", fontSize: '25px', color: '#9B7663' }}>{t('c07.008')}</span>
            {isInvitee ? (
              <>
                <button className="btn tap" type="button" disabled={busy} onClick={accept} style={{ width: '100%', minHeight: '52px', marginTop: '6px', background: '#39342F', color: '#FAF7F0', border: '0', borderRadius: '2px', fontSize: '12px', letterSpacing: '.18em', cursor: 'pointer' }}>
                  {t('c07.009')}
                </button>
                <button className="tap" type="button" disabled={busy} onClick={later} style={{ width: '100%', minHeight: '50px', background: 'transparent', color: '#39342F', border: '1px solid #CDBBA3', borderRadius: '2px', fontSize: '11px', letterSpacing: '.12em', cursor: 'pointer' }}>
                  {t('c07.010')}
                </button>
              </>
            ) : (
              <p style={{ ...hand(17, '#525B50'), margin: '6px 0 0' }}>
                {inv!.status === 'PENDING' && `Tấm thiệp đã nằm trong hộp thư — đang chờ ${partner?.displayName} mở.`}
                {inv!.status === 'THINKING' && `${partner?.displayName} muốn suy nghĩ thêm một chút.`}
                {inv!.status === 'ACCEPTED' && `${partner?.displayName} đã nói "có"!`}
              </p>
            )}
            {showCard && inv!.status !== 'PENDING' && (
              <button className="tap" type="button" onClick={() => setShowCard(false)} style={{ ...lightBtn, alignSelf: 'center' }}>
                ← Quay lại
              </button>
            )}
            {error && <span style={hand(15, '#A8655A')}>{error}</span>}
          </div>
        </div>
      )}

      {view === 'later' && (
        <div className="fade" style={{ marginTop: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
          <div style={{ padding: '26px 22px', background: '#FAF7F0', transform: 'rotate(-1deg)', boxShadow: '0 20px 36px -20px rgba(57,52,47,.45)' }}>
            <p style={{ margin: '0', ...hand(22, '#525B50'), lineHeight: '1.45' }}>
              {isInvitee ? t('c07.011') : `${partner?.displayName} muốn suy nghĩ thêm một chút. Không vội đâu.`}
            </p>
          </div>
          <button className="tap" type="button" onClick={() => setShowCard(true)} style={{ minHeight: '46px', padding: '0 20px', background: 'transparent', border: '1px solid #CDBBA3', borderRadius: '2px', color: '#39342F', fontFamily: "'Patrick Hand', cursive", fontSize: '18px', cursor: 'pointer' }}>
            {t('c07.012')}
          </button>
        </div>
      )}

      {view === 'ticket' && inv && (
        <div style={{ position: 'relative', marginTop: '24px' }}>
          <div className="m7away" aria-hidden="true" style={{ position: 'absolute', left: '0', right: '0', top: '0', height: '420px', background: '#FAF7F0', border: '1px solid #CDBBA3', zIndex: '3' }}></div>
          <div className="m7ticket" role="group" aria-label={t('c07.013')} style={{ position: 'relative', background: '#2E2A26', padding: '14px 10px', transform: 'rotate(-1deg)', boxShadow: '0 30px 50px -24px rgba(57,52,47,.65)' }}>
            <div aria-hidden="true" style={{ position: 'absolute', left: '0', right: '0', top: '0', height: '10px', backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 10px, #F3EBDD 10px 18px, transparent 18px 24px)' }}></div>
            <div aria-hidden="true" style={{ position: 'absolute', left: '0', right: '0', bottom: '0', height: '10px', backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 10px, #F3EBDD 10px 18px, transparent 18px 24px)' }}></div>
            <div style={{ background: '#FAF7F0', padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '9px', letterSpacing: '.28em', color: '#9B7663' }}>{t('c07.014')}</span>
                <span style={{ fontSize: '9px', letterSpacing: '.2em', color: '#6B6158' }}>{t('c07.015')}</span>
              </div>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '34px', lineHeight: '1', fontWeight: '500' }}>{t('c07.016')}</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px 14px', borderTop: '1px dashed #CDBBA3', paddingTop: '12px' }}>
                <TicketField label={t('c07.017')} value={t('c07.018')} />
                <TicketField label={t('c07.019')} value={confirmed ? confirmed.activity : t('c07.016')} />
                <TicketField label={t('c07.020')} value={confirmed ? whenLabel(confirmed) : t('c07.021')} />
                <TicketField label={t('c07.022')} value={confirmed?.location || t('c07.021')} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', borderTop: '2px dashed #E6D8C5', paddingTop: '10px' }}>
                <span style={{ fontSize: '8px', letterSpacing: '.24em', color: '#6B6158' }}>{t('c07.023')}</span>
                <span style={hand(19, confirmed ? '#525B50' : '#A8655A')}>{confirmed ? 'Written by both of us ✓' : t('c07.024')}</span>
              </div>
            </div>
          </div>

          <div className="m7later" style={{ marginTop: '36px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {inv.proposals.length > 0 && (
              <section aria-label="Các gợi ý" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={label9}>CÁC GỢI Ý</span>
                {inv.proposals.map((p, i) => {
                  const otherAgreed = isInvitee ? p.inviterAgreed : p.inviteeAgreed
                  return (
                    <div key={p.id} style={{ background: p.confirmed ? '#FAF7F0' : '#FFFFFF', border: p.confirmed ? '2px solid #525B50' : '1px solid #E6D8C5', padding: '14px 14px 12px', transform: `rotate(${i % 2 ? 0.6 : -0.6}deg)`, display: 'flex', flexDirection: 'column', gap: '6px', boxShadow: '0 12px 22px -16px rgba(57,52,47,.45)' }}>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '21px', fontWeight: 500 }}>{p.activity}</span>
                      <span style={hand(16, '#525B50')}>{whenLabel(p)}{p.location ? ' · ' + p.location : ''}</span>
                      {p.note && <span style={hand(15, '#6B6158')}>“{p.note}”</span>}
                      <span style={{ fontSize: '11px', color: '#6B6158' }}>gợi ý bởi {p.proposerName}</span>
                      {p.confirmed ? (
                        <span style={hand(17, '#525B50')}>Cả hai đã đồng ý ✓</span>
                      ) : p.agreedByMe ? (
                        <span style={hand(16, '#9B7663')}>{otherAgreed ? 'Cả hai đã đồng ý ✓' : `Đang chờ ${partner?.displayName} đồng ý…`}</span>
                      ) : !inv.confirmedProposalId ? (
                        <button className="btn tap" type="button" disabled={busy} onClick={() => void s.agree(p.id)} style={{ ...darkBtn, minHeight: '44px', fontSize: '17px' }}>
                          Mình đồng ý với gợi ý này
                        </button>
                      ) : null}
                    </div>
                  )
                })}
              </section>
            )}

            {confirmed ? (
              <div className="fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
                <div style={{ padding: '22px 20px', background: '#FAF7F0', transform: 'rotate(-1deg)', boxShadow: '0 20px 36px -20px rgba(57,52,47,.45)' }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px' }}>Đã chốt rồi nhé!</span>
                </div>
                <button className="btn tap" type="button" onClick={() => go(7)} style={{ ...darkBtn, width: '100%' }}>{t('c07.036')}</button>
              </div>
            ) : editing ? (
              <div style={{ background: '#FAF7F0', padding: '22px 16px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 20px 36px -22px rgba(57,52,47,.45)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px' }}>{isInvitee ? t('c07.025') : 'Gợi ý một kế hoạch'}</span>
                  <span style={hand(16, '#525B50')}>{t('c07.026')}</span>
                </div>
                <span style={label9}>{t('c07.027')}</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '-8px' }}>
                  {activities.map((a) => (
                    <button key={a} className="tap" type="button" onClick={() => setAct(act === a ? null : a)} aria-pressed={act === a} style={chip(act === a)}>
                      {a}
                    </button>
                  ))}
                </div>
                <span style={label9}>{t('c07.028')}</span>
                <div data-nonav="1" className="hs" style={{ display: 'flex', gap: '6px', overflowX: 'auto', margin: '-8px -16px 0', padding: '2px 16px 6px', touchAction: 'pan-x' }}>
                  {days.map((dt) => {
                    const key = isoDay(dt)
                    const sel = day === key
                    return (
                      <button key={key} className="tap" type="button" onClick={() => setDay(sel ? null : key)} aria-pressed={sel} aria-label={dayLabel(key)} style={{ flex: '0 0 52px', minHeight: '60px', border: '1px solid #E6D8C5', borderRadius: '2px', background: sel ? '#39342F' : '#FAF7F0', color: sel ? '#FAF7F0' : '#39342F', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', fontFamily: 'Inter, sans-serif' }}>
                        <span style={{ fontSize: '9px' }}>{DOW[dt.getDay()]}</span>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: '600', lineHeight: '1' }}>{dt.getDate()}</span>
                      </button>
                    )
                  })}
                </div>
                <span style={label9}>{t('c07.029')}</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '-8px' }}>
                  {SLOTS.map((s) => (
                    <button key={s.id} className="tap" type="button" onClick={() => setSlot(slot === s.id ? null : s.id)} aria-pressed={slot === s.id} style={chip(slot === s.id)}>
                      {s.label}
                    </button>
                  ))}
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...label9 }}>
                  GIỜ CỤ THỂ (NẾU CÓ)
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={inputStyle} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...label9 }}>
                  ĐỊA ĐIỂM (NẾU CÓ)
                  <input type="text" maxLength={200} value={place} onChange={(e) => setPlace(e.target.value)} style={inputStyle} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...label9 }}>
                  {t('c07.030')}
                  <input type="text" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('c07.031')} style={inputStyle} />
                </label>
                {error && <span role="alert" style={hand(15, '#A8655A')}>{error}</span>}
                <button className="btn tap" type="button" disabled={busy} onClick={() => void sendProposal()} style={darkBtn}>
                  {isInvitee ? t('c07.032') : `Gửi gợi ý cho ${partner?.displayName}`}
                </button>
                <button className="tap" type="button" onClick={() => setShowCard(true)} style={{ minHeight: '44px', background: 'transparent', border: '0', color: '#39342F', fontSize: '11px', letterSpacing: '.14em', cursor: 'pointer' }}>
                  {t('c07.033')}
                </button>
              </div>
            ) : (
              <div className="fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
                <div style={{ padding: '22px 20px', background: '#FAF7F0', transform: 'rotate(-1deg)', boxShadow: '0 20px 36px -20px rgba(57,52,47,.45)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px' }}>{t('c07.034')}</span>
                  <span style={hand(17, '#525B50')}>{lastSummary}</span>
                  <span style={{ ...hand(17), lineHeight: '1.4' }}>{t('c07.035')}</span>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', gap: '6px', ...hand(16, '#525B50') }}>
                  {t('d07.028')}
                  <button type="button" onClick={() => go(7)} style={{ minHeight: '40px', padding: '0 4px', border: '0', borderBottom: '1px solid #9B7663', background: 'transparent', color: '#39342F', fontFamily: "'Patrick Hand', cursive", fontSize: '16px', cursor: 'pointer' }}>{t('d07.029')}</button>
                </span>
                <button className="btn tap" type="button" onClick={() => go(7)} style={{ ...darkBtn, width: '100%' }}>{t('c07.036')}</button>
                <button className="tap" type="button" onClick={() => setEditing(true)} style={lightBtn}>{t('c07.037')}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function TicketField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ fontSize: '8px', letterSpacing: '.24em', color: '#6B6158' }}>{label}</span>
      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px' }}>{value}</span>
    </div>
  )
}
