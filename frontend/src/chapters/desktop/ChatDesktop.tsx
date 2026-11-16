import { useLayoutEffect, useRef, type CSSProperties, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react'
import { apiUrl } from '../../api/http'
import { useAuth } from '../../auth/AuthContext'
import { useChatSession, type ChatSessionValue } from '../../chat/ChatSession'
import { ACCEPTED_IMAGES, NOTE_MAX } from '../../chat/limits'
import PlanCard from '../../chat/PlanCard'
import { invitationConfirmed } from '../../chat/plans'
import type { UiMessage } from '../../chat/useChat'
import { fill, parts } from '../../story/fill'
import { useStory } from '../../story/StoryContext'
import type { ChapterProps } from '../types'

const hand = "'Patrick Hand', cursive"
const serif = "'Cormorant Garamond', serif"
const EMOJIS = ['🙂', '😊', '😂', '🤭', '🥹', '☕', '🍝', '🌅', '📷', '✨', '🐱', '👋']
const pad = (n: number) => String(n).padStart(2, '0')
const srOnly: CSSProperties = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }
const iconBtn: CSSProperties = { width: 44, height: 44, flex: '0 0 auto', border: 0, borderRadius: '50%', background: 'transparent', color: '#39342F', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }

/**
 * Chapter 08, desktop layout (Chat.dc.html). The design's "preview mode" (localStorage) is
 * NOT used: everything comes from the shared ChatSession, i.e. the real useChat() over
 * STOMP: presence, typing, read receipts, images, notes and older pages.
 */
export default function ChatDesktop({ go }: ChapterProps) {
  const { t } = useStory()
  const s = useChatSession()
  return (
    <div style={{ position: 'relative', background: '#F3EBDD', overflow: 'clip' }}>
      <div style={{ position: 'relative', maxWidth: 860, margin: '0 auto', padding: '84px 32px 90px', boxSizing: 'border-box' }}>
        <header className="d-rise" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
          <span style={{ fontSize: 11, letterSpacing: '.3em', color: '#525B50' }}>{t('d08.026')}</span>
          <h2 style={{ margin: 0, fontFamily: serif, fontWeight: 500, fontSize: 60, lineHeight: 1 }}>
            {t('c08.001')} <em style={{ fontWeight: 400, color: '#9B7663' }}>{t('c08.002')}</em>
          </h2>
          <p style={{ margin: 0, fontFamily: serif, fontStyle: 'italic', fontSize: 22, color: '#525B50' }}>{t('c08.003')}</p>
        </header>
        {s ? <ChatBox s={s} go={go} /> : <div style={{ marginTop: 44, height: 'clamp(560px, calc(100dvh - 160px), 780px)', background: '#FAF7F0' }} aria-busy="true" />}
        <p style={{ margin: '22px 0 0', textAlign: 'center', fontFamily: hand, fontSize: 19, color: '#9B7663' }}>{t('d08.001')}</p>
      </div>
    </div>
  )
}

function ChatBox({ s, go }: { s: ChatSessionValue; go: (i: number) => void }) {
  const { t, asset, story } = useStory()
  const { user } = useAuth()
  const me = user!
  const { chat } = s
  const logRef = useRef<HTMLDivElement | null>(null)
  const nearBottom = useRef(true)
  const prevHeight = useRef(0)
  const partnerName = chat.partner?.displayName ?? ''
  const avatarFile = chat.partner ? story?.avatars?.[chat.partner.username] : undefined
  const emojiNames = parts(t('d08.025'))

  // Keep the newest message in view (unless reading older ones); keep position when a page is prepended.
  useLayoutEffect(() => {
    const el = logRef.current
    if (!el) return
    if (nearBottom.current) el.scrollTop = el.scrollHeight
    else if (prevHeight.current && el.scrollHeight > prevHeight.current && el.scrollTop < 40) el.scrollTop += el.scrollHeight - prevHeight.current
    prevHeight.current = el.scrollHeight
  }, [chat.messages, chat.partnerTyping])

  const onScroll = () => {
    const el = logRef.current
    if (el) nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }
  const sendNow = () => {
    if (s.sendNow()) nearBottom.current = true
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault()
      sendNow()
    }
  }
  const onText = (e: ChangeEvent<HTMLInputElement>) => {
    s.setText(e.target.value)
    chat.notifyTyping(e.target.value.length > 0)
  }
  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) await s.pickFile(file)
  }
  const sendNote = () => {
    if (s.sendNote()) nearBottom.current = true
  }
  const err = !s.err ? '' : s.err.kind === 'type' ? t('d08.015') : s.err.kind === 'size' ? t('d08.016') : (s.err.message ?? t('d08.017'))

  const dayLabel = (d: Date) => {
    const today = new Date()
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
    if (d.toDateString() === today.toDateString()) return t('d08.013')
    if (d.toDateString() === yesterday.toDateString()) return t('d08.014')
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
  }
  const days = chat.messages.map((m) => dayLabel(new Date(m.createdAt)))

  return (
    <section aria-label={t('c08.004')} style={{ position: 'relative', marginTop: 44, height: 'clamp(560px, calc(100dvh - 160px), 780px)', display: 'flex', flexDirection: 'column', background: '#FAF7F0', boxShadow: '0 2px 3px rgba(57,52,47,.1), 0 44px 80px -40px rgba(57,52,47,.5)' }}>
      <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: -13, width: 130, height: 26, marginLeft: -65, background: 'rgba(199,143,145,.5)', transform: 'rotate(-3deg)', zIndex: 2 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 24px', borderBottom: '1px solid #E6D8C5' }}>
        <span style={{ position: 'relative', flex: '0 0 auto' }}>
          {avatarFile ? (
            <img src={asset(avatarFile)} alt="" style={{ width: 50, height: 50, display: 'block', borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 30%', border: '2px solid #FFFFFF', boxShadow: '0 4px 10px -4px rgba(57,52,47,.4)' }} />
          ) : (
            <span aria-hidden="true" style={{ width: 50, height: 50, borderRadius: '50%', background: '#E6D8C5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Dancing Script', cursive", fontSize: 24 }}>{partnerName.charAt(0)}</span>
          )}
          <span aria-hidden="true" style={{ position: 'absolute', right: 1, bottom: 2, width: 12, height: 12, borderRadius: '50%', border: '2px solid #FAF7F0', background: chat.partnerOnline ? '#6E8B5E' : '#CDBBA3' }} />
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0 }}>
            <span style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, lineHeight: 1 }}>{partnerName}</span>
            <span style={{ fontSize: 12, color: chat.partnerOnline ? '#525B50' : '#6B6158', whiteSpace: 'nowrap' }}>{chat.partnerOnline ? t('d08.002') : t('d08.003')}</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#525B50', minWidth: 0 }}>
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: '0 0 auto' }}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t('c08.007')}</span>
          </span>
        </div>
        <button className="d-ib" type="button" onClick={() => s.setNoteOpen(true)} style={{ minHeight: 44, padding: '0 14px', border: '1px dashed #9B7663', borderRadius: 2, background: 'transparent', color: '#39342F', fontFamily: hand, fontSize: 18, cursor: 'pointer' }}>{t('c08.008')}</button>
      </div>

      <div ref={logRef} onScroll={onScroll} role="log" aria-live="polite" className="d-log" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '26px 30px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {chat.hasMore && (
          <button type="button" className="d-ib" onClick={() => void chat.loadOlder()} disabled={chat.loadingOlder} style={{ alignSelf: 'center', minHeight: 38, padding: '0 16px', border: '1px solid #E6D8C5', borderRadius: 999, background: '#FFFFFF', color: '#525B50', fontSize: 13, cursor: 'pointer' }}>
            {chat.loadingOlder ? t('d08.011') : t('d08.010')}
          </button>
        )}
        {!chat.hasMore && (
          <article aria-label={t('c08.009')} style={{ alignSelf: 'center', width: '100%', maxWidth: 520, position: 'relative', background: '#FFFFFF', backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 31px, rgba(155,118,99,.14) 31px 32px)', padding: '30px 32px 24px 44px', boxSizing: 'border-box', transform: 'rotate(-.6deg)', boxShadow: '0 1px 2px rgba(57,52,47,.1), 0 18px 34px -20px rgba(57,52,47,.4)', marginBottom: 12 }}>
            <div aria-hidden="true" style={{ position: 'absolute', left: 28, top: 0, bottom: 0, width: 1, background: 'rgba(199,143,145,.55)' }} />
            <div style={{ fontFamily: hand, fontSize: 19, lineHeight: '32px', color: '#39342F' }}>
              <p style={{ margin: 0, fontFamily: "'Dancing Script', cursive", fontSize: 28 }}>{t('c08.010')}</p>
              <p style={{ margin: 0 }}>{t('c08.011')}</p>
              <p style={{ margin: 0 }}>{t('c08.012')}</p>
              <p style={{ margin: 0 }}>{t('c08.013')}</p>
              <p style={{ margin: '6px 0 0', textAlign: 'right', fontFamily: "'Dancing Script', cursive", fontSize: 26, color: '#9B7663' }}>{t('c08.014')}</p>
            </div>
          </article>
        )}
        {chat.loadError && <p role="alert" style={{ alignSelf: 'center', fontFamily: hand, fontSize: 18, color: '#A8655A' }}>{chat.loadError}</p>}
        {!chat.loadError && chat.conversation && chat.messages.length === 0 && (
          <p style={{ alignSelf: 'center', margin: '10px 0 0', fontFamily: hand, fontSize: 19, color: '#6B6158', textAlign: 'center' }}>{t('d08.018')}</p>
        )}
        {chat.messages.map((m, i) => (
          <Bubble key={m.clientMessageId} m={m} mine={m.senderId === me.id} index={i} day={days[i]} showDay={i === 0 || days[i] !== days[i - 1]}
            read={m.id > 0 && chat.partnerReadUpTo >= m.id} onRetry={() => chat.retry(m.clientMessageId)} t={t}
            plan={m.type === 'PLAN' && m.plan ? (
              <PlanCard wide plan={m.plan} myId={me.id} partnerName={partnerName} invitationConfirmed={invitationConfirmed(chat.messages, m.plan.invitationId)}
                busy={s.planBusy === m.plan.proposalId} error={s.planError?.proposalId === m.plan.proposalId ? (s.planError.message ?? '') : undefined}
                onAgree={() => void s.agreePlan(m.plan!)} onOpen={() => go(6)} t={t} rotate={i % 2 ? '1deg' : '-1deg'} />
            ) : null} />
        ))}
        {chat.partnerTyping && (
          <div className="msg" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#FFFFFF', borderRadius: '16px 16px 16px 4px', fontSize: 13, color: '#6B6158' }}>
            <span>{fill(t('d08.004'), { name: partnerName })}</span>
            <span aria-hidden="true" style={{ display: 'inline-flex', gap: 3 }}>
              {[0, 1, 2].map((k) => <span key={k} className="dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#9B7663', animationDelay: `${k * 0.2}s` }} />)}
            </span>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid #E6D8C5', padding: '12px 16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(s.pending || s.uploading) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 8, background: '#F3EBDD', border: '1px dashed #CDBBA3' }}>
            {s.pending && <img src={s.pending.preview} alt={t('c08.018')} style={{ width: 60, height: 46, objectFit: 'cover' }} />}
            <span style={{ flex: 1, fontSize: 13, color: '#525B50' }}>{s.uploading ? t('d08.012') : t('d08.019')}</span>
            {s.pending && (
              <button className="d-ib" type="button" onClick={s.clearPending} aria-label={t('c08.020')} style={{ ...iconBtn, width: 40, height: 40 }}>
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            )}
          </div>
        )}
        {err && <span role="alert" style={{ fontSize: 13, color: '#A8655A' }}>{err}</span>}
        {s.showEmoji && (
          <div role="group" aria-label={t('c08.021')} style={{ display: 'flex', flexWrap: 'wrap', gap: 2, padding: 6, background: '#F3EBDD' }}>
            {EMOJIS.map((ch, i) => (
              <button key={ch} className="d-ib" type="button" onClick={() => s.setText((x) => x + ch)} aria-label={emojiNames[i] ?? ch} style={{ width: 44, height: 44, border: 0, borderRadius: 6, background: 'transparent', fontSize: 22, cursor: 'pointer' }}>{ch}</button>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label className="d-ib" aria-label={t('c08.022')} style={{ ...iconBtn, cursor: 'pointer' }}>
            <input type="file" accept={ACCEPTED_IMAGES.join(',')} onChange={(e) => void onFile(e)} style={srOnly} />
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="1" /><circle cx="9" cy="10" r="1.6" /><path d="M21 16l-5-5-8 8" /></svg>
          </label>
          <button className="d-ib" type="button" onClick={() => s.setShowEmoji((v) => !v)} aria-label={t('c08.021')} aria-expanded={s.showEmoji} style={iconBtn}>
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M8.5 14.5c1 1.3 2.2 2 3.5 2s2.5-.7 3.5-2" /><path d="M9 9.5h.01M15 9.5h.01" /></svg>
          </button>
          <label style={{ flex: 1, minWidth: 0, display: 'flex' }}>
            <span style={srOnly}>{t('c08.023')}</span>
            <input type="text" value={s.text} maxLength={4000} onChange={onText} onKeyDown={onKey} onBlur={() => chat.notifyTyping(false)} placeholder={fill(t('d08.020'), { name: partnerName })} style={{ flex: 1, minWidth: 0, minHeight: 48, padding: '0 18px', border: '1px solid #E6D8C5', borderRadius: 999, background: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#39342F' }} />
          </label>
          <button className="d-send" type="button" onClick={sendNow} disabled={!s.canSend} aria-label={t('c08.025')} style={{ width: 48, height: 48, flex: '0 0 auto', border: 0, borderRadius: '50%', background: '#39342F', color: '#FAF7F0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
          </button>
        </div>
        <span style={{ fontSize: 11, color: '#6B6158', textAlign: 'center' }}>{chat.connected ? fill(t('d08.022'), { name: partnerName }) : t('d08.023')}</span>
      </div>

      {s.noteOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(57,52,47,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, boxSizing: 'border-box' }}>
          <div className="d-sheet" role="dialog" aria-modal="true" aria-label={t('c08.026')} style={{ position: 'relative', width: 440, maxWidth: '100%', background: '#E6D8C5', padding: '30px 28px 22px', boxSizing: 'border-box', transform: 'rotate(-1deg)', boxShadow: '0 30px 60px -24px rgba(0,0,0,.5)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span aria-hidden="true" style={{ position: 'absolute', left: '50%', top: -11, width: 90, height: 22, marginLeft: -45, background: 'rgba(250,247,240,.7)', transform: 'rotate(3deg)' }} />
            <span style={{ fontFamily: serif, fontSize: 28 }}>{t('c08.008')}</span>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={srOnly}>{t('c08.027')}</span>
              <textarea rows={5} maxLength={NOTE_MAX} value={s.note} onChange={(e) => s.setNote(e.target.value.slice(0, NOTE_MAX))} placeholder={fill(t('d08.021'), { name: partnerName })} autoFocus
                style={{ resize: 'none', padding: 14, border: 0, background: '#FAF7F0', backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 29px, rgba(155,118,99,.2) 29px 30px)', lineHeight: '30px', fontFamily: hand, fontSize: 20, color: '#39342F' }} />
            </label>
            <span style={{ alignSelf: 'flex-end', fontSize: 11, color: '#6B6158' }}>{s.note.length} / {NOTE_MAX}</span>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="d-ib" type="button" onClick={() => s.setNoteOpen(false)} style={{ minHeight: 44, padding: '0 16px', border: 0, background: 'transparent', color: '#39342F', fontSize: 12, letterSpacing: '.14em', cursor: 'pointer' }}>{t('c08.029')}</button>
              <button className="d-send" type="button" onClick={sendNote} disabled={!s.note.trim()} style={{ minHeight: 44, padding: '0 22px', border: 0, borderRadius: 2, background: '#39342F', color: '#FAF7F0', fontFamily: hand, fontSize: 19, cursor: 'pointer' }}>{t('c08.030')}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

type BubbleProps = { m: UiMessage; mine: boolean; index: number; showDay: boolean; day: string; read: boolean; onRetry: () => void; t: (k: string) => string; plan?: ReactNode }

function Bubble({ m, mine, index, showDay, day, read, onRetry, t, plan }: BubbleProps) {
  const d = new Date(m.createdAt)
  const rot = `${index % 2 ? 1.2 : -1.2}deg`
  const status = !mine || m.status === 'failed' ? '' : ' · ' + (m.status === 'sending' ? t('d08.005') : read ? t('d08.007') : t('d08.006'))
  return (
    <div className="msg" style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', gap: 4, opacity: m.status === 'sending' ? 0.7 : 1 }}>
      {showDay && (
        <div style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: 12, margin: '10px 0 4px' }}>
          <span style={{ flex: 1, height: 1, background: '#E6D8C5' }} />
          <span style={{ fontSize: 10, letterSpacing: '.24em', color: '#6B6158' }}>{day}</span>
          <span style={{ flex: 1, height: 1, background: '#E6D8C5' }} />
        </div>
      )}
      {m.type === 'TEXT' && (
        <div style={{ maxWidth: '72%', padding: '11px 16px', background: mine ? '#525B50' : '#FFFFFF', color: mine ? '#FAF7F0' : '#39342F', borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: 15, lineHeight: 1.5, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{m.content}</div>
      )}
      {m.type === 'IMAGE' && m.image && (
        <div style={{ width: 260, maxWidth: '72%', background: '#FFFFFF', padding: '8px 8px 0', transform: `rotate(${rot})`, boxShadow: '0 12px 22px -12px rgba(57,52,47,.45)' }}>
          <a href={apiUrl(m.image.url)} target="_blank" rel="noreferrer">
            <img src={apiUrl(m.image.url)} alt={m.content ?? t('d08.024')} loading="lazy" width={m.image.width ?? undefined} height={m.image.height ?? undefined} style={{ display: 'block', width: '100%', height: 'auto', maxHeight: 320, objectFit: 'cover' }} />
          </a>
          <p style={{ margin: 0, padding: '6px 2px 10px', fontFamily: hand, fontSize: 17, color: '#525B50', minHeight: 6 }}>{m.content}</p>
        </div>
      )}
      {m.type === 'NOTE' && (
        <div style={{ position: 'relative', width: 300, maxWidth: '80%', background: '#E6D8C5', padding: '20px 20px 16px', boxSizing: 'border-box', transform: `rotate(${rot})`, boxShadow: '0 12px 22px -12px rgba(57,52,47,.4)' }}>
          <span aria-hidden="true" style={{ position: 'absolute', left: '50%', top: -9, width: 70, height: 18, marginLeft: -35, background: 'rgba(250,247,240,.7)', transform: 'rotate(3deg)' }} />
          <span style={{ display: 'block', fontSize: 9, letterSpacing: '.26em', color: '#9B7663', marginBottom: 6 }}>{t('c08.017')}</span>
          <span style={{ display: 'block', fontFamily: hand, fontSize: 20, lineHeight: 1.4, color: '#39342F', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{m.content}</span>
        </div>
      )}
      {plan}
      <span style={{ fontSize: 11, color: m.status === 'failed' ? '#A8655A' : '#6B6158' }}>
        {pad(d.getHours())}:{pad(d.getMinutes())}
        {status}
        {m.status === 'failed' && (
          <>
            {' · '}
            {m.error ?? t('d08.008')}{' '}
            <button type="button" onClick={onRetry} style={{ border: 0, background: 'transparent', color: '#A8655A', textDecoration: 'underline', fontSize: 11, cursor: 'pointer', padding: 0 }}>{t('d08.009')}</button>
          </>
        )}
      </span>
    </div>
  )
}
