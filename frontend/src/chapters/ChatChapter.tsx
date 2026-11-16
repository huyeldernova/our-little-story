import { useLayoutEffect, useRef, type CSSProperties, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react'
import { apiUrl } from '../api/http'
import { useAuth } from '../auth/AuthContext'
import { useChatSession, type ChatSessionValue } from '../chat/ChatSession'
import { NOTE_MAX } from '../chat/limits'
import PlanCard from '../chat/PlanCard'
import { invitationConfirmed } from '../chat/plans'
import type { UiMessage } from '../chat/useChat'
import { useStory } from '../story/StoryContext'
import type { ChapterProps } from './types'

const EMOJIS: [string, string][] = [
  ['🙂', 'cười'], ['😊', 'vui'], ['😂', 'cười lớn'], ['🤭', 'che miệng cười'], ['🥹', 'cảm động'], ['☕', 'cà phê'],
  ['🍝', 'mì Ý'], ['🌅', 'hoàng hôn'], ['📷', 'máy ảnh'], ['✨', 'lấp lánh'], ['🐱', 'mèo'], ['👋', 'vẫy tay'],
]

const pad = (n: number) => String(n).padStart(2, '0')
function dayLabel(d: Date): string {
  const today = new Date()
  const y = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'HÔM NAY'
  if (d.toDateString() === y.toDateString()) return 'HÔM QUA'
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}
const srOnly: CSSProperties = { position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }

const rootStyle: CSSProperties = { position: 'absolute', inset: '0', background: '#F3EBDD', padding: '88px 10px 10px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '8px' }

export default function ChatChapter({ turn, go }: ChapterProps) {
  const session = useChatSession()
  if (!session) return <div className={`pg ${turn}`} style={rootStyle} />
  return <ChatMobile turn={turn} s={session} go={go} />
}

/** Chapter 08 (mobile layout). Connection and drafts come from the shared ChatSession. */
function ChatMobile({ turn, s, go }: { turn: string; s: ChatSessionValue; go: (i: number) => void }) {
  const { t, asset, story } = useStory()
  const { user } = useAuth()
  const me = user!
  const { chat, text, setText, showEmoji, setShowEmoji, noteOpen, setNoteOpen, note, setNote, pending, uploading, canSend } = s
  const err = !s.err
    ? ''
    : s.err.kind === 'type'
      ? 'Chỉ gửi được ảnh JPEG, PNG hoặc WebP thôi nhé.'
      : s.err.kind === 'size'
        ? 'Ảnh lớn hơn 10 MB rồi, chọn ảnh nhỏ hơn nhé.'
        : (s.err.message ?? 'Không tải được ảnh lên.')
  const logRef = useRef<HTMLDivElement | null>(null)
  const nearBottom = useRef(true)
  const prevHeight = useRef(0)
  const partnerName = chat.partner?.displayName ?? ''
  const avatarFile = chat.partner ? story?.avatars?.[chat.partner.username] : undefined

  // Keep the newest message in view (unless the user scrolled up to read older ones).
  useLayoutEffect(() => {
    const el = logRef.current
    if (!el) return
    if (nearBottom.current) el.scrollTop = el.scrollHeight
    else if (prevHeight.current && el.scrollHeight > prevHeight.current && el.scrollTop < 40) {
      el.scrollTop += el.scrollHeight - prevHeight.current // older page prepended
    }
    prevHeight.current = el.scrollHeight
  }, [chat.messages, chat.partnerTyping])

  const onScroll = () => {
    const el = logRef.current
    if (!el) return
    nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
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
    setText(e.target.value)
    chat.notifyTyping(e.target.value.length > 0)
  }
  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    await s.pickFile(file)
  }
  const sendNote = () => {
    if (s.sendNote()) nearBottom.current = true
  }

  const dayFlags = chat.messages.map((m, i) => {
    const dl = dayLabel(new Date(m.createdAt))
    return { dl, show: i === 0 || dl !== dayLabel(new Date(chat.messages[i - 1].createdAt)) }
  })
  return (
    <div className={`pg ${turn}`} style={rootStyle}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 6px' }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: '500', lineHeight: '1' }}>
          {t('c08.001')} <em style={{ fontWeight: '400', color: '#9B7663' }}>{t('c08.002')}</em>
        </span>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '14px', color: '#525B50' }}>{t('c08.003')}</span>
      </div>
      <section aria-label={t('c08.004')} style={{ position: 'relative', flex: '1', minHeight: '0', display: 'flex', flexDirection: 'column', background: '#FAF7F0', boxShadow: '0 24px 44px -28px rgba(57,52,47,.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderBottom: '1px solid #E6D8C5' }}>
          <span style={{ position: 'relative', flex: '0 0 auto' }}>
            {avatarFile ? (
              <img src={asset(avatarFile)} alt="" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 30%', border: '2px solid #FFFFFF', display: 'block' }} />
            ) : (
              <span aria-hidden="true" style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#E6D8C5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Dancing Script', cursive", fontSize: '20px' }}>{partnerName.charAt(0)}</span>
            )}
            <span aria-hidden="true" style={{ position: 'absolute', right: '0', bottom: '1px', width: '10px', height: '10px', borderRadius: '50%', border: '2px solid #FAF7F0', background: chat.partnerOnline ? '#6E8B5E' : '#CDBBA3' }}></span>
          </span>
          <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: '6px', minWidth: 0 }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: '600', lineHeight: '1' }}>{partnerName}</span>
              <span style={{ fontSize: '10px', color: chat.partnerOnline ? '#525B50' : '#6B6158', whiteSpace: 'nowrap' }}>{chat.partnerOnline ? 'đang online' : 'offline'}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#525B50', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: '0 0 auto' }}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('c08.007')}</span>
            </span>
          </div>
          <button className="tap" type="button" onClick={() => setNoteOpen(true)} style={{ minHeight: '40px', padding: '0 10px', border: '1px dashed #9B7663', borderRadius: '2px', background: 'transparent', color: '#39342F', fontFamily: "'Patrick Hand', cursive", fontSize: '15px', cursor: 'pointer' }}>
            {t('c08.008')}
          </button>
        </div>

        <div ref={logRef} onScroll={onScroll} data-nonav="1" role="log" aria-live="polite" className="hs" style={{ flex: '1', minHeight: '0', overflowY: 'auto', padding: '18px 12px', display: 'flex', flexDirection: 'column', gap: '8px', touchAction: 'pan-y' }}>
          {chat.hasMore && (
            <button type="button" onClick={() => void chat.loadOlder()} disabled={chat.loadingOlder} style={{ alignSelf: 'center', minHeight: '36px', padding: '0 12px', border: '1px solid #E6D8C5', borderRadius: '999px', background: '#FFFFFF', color: '#525B50', fontSize: '12px', cursor: 'pointer' }}>
              {chat.loadingOlder ? 'Đang tải…' : 'Xem tin nhắn cũ hơn'}
            </button>
          )}
          {!chat.hasMore && (
            <article aria-label={t('c08.009')} style={{ position: 'relative', background: '#FFFFFF', backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 27px, rgba(155,118,99,.14) 27px 28px)', padding: '22px 16px 16px 30px', boxSizing: 'border-box', transform: 'rotate(-.5deg)', boxShadow: '0 14px 26px -16px rgba(57,52,47,.4)', marginBottom: '8px' }}>
              <div aria-hidden="true" style={{ position: 'absolute', left: '18px', top: '0', bottom: '0', width: '1px', background: 'rgba(199,143,145,.55)' }}></div>
              <div style={{ fontFamily: "'Patrick Hand', cursive", fontSize: '16px', lineHeight: '28px' }}>
                <p style={{ margin: '0', fontFamily: "'Dancing Script', cursive", fontSize: '24px' }}>{t('c08.010')}</p>
                <p style={{ margin: '0' }}>{t('c08.011')}</p>
                <p style={{ margin: '0' }}>{t('c08.012')}</p>
                <p style={{ margin: '0' }}>{t('c08.013')}</p>
                <p style={{ margin: '4px 0 0', textAlign: 'right', fontFamily: "'Dancing Script', cursive", fontSize: '22px', color: '#9B7663' }}>{t('c08.014')}</p>
              </div>
            </article>
          )}
          {chat.loadError && <p role="alert" style={{ alignSelf: 'center', fontFamily: "'Patrick Hand', cursive", fontSize: '16px', color: '#A8655A' }}>{chat.loadError}</p>}
          {!chat.loadError && chat.conversation && chat.messages.length === 0 && (
            <p style={{ alignSelf: 'center', margin: '4px 0 0', fontFamily: "'Patrick Hand', cursive", fontSize: '16px', color: '#6B6158', textAlign: 'center' }}>
              Chưa có tin nhắn nào — cứ viết dòng đầu tiên nhé.
            </p>
          )}
          {chat.messages.map((m, i) => {
            const { dl, show } = dayFlags[i]
            return (
              <Bubble key={m.clientMessageId} m={m} mine={m.senderId === me.id} index={i} showDay={show} day={dl}
                read={m.id > 0 && chat.partnerReadUpTo >= m.id} noteLabel={t('c08.017')} onRetry={() => chat.retry(m.clientMessageId)}
                plan={m.type === 'PLAN' && m.plan ? (
                  <PlanCard plan={m.plan} myId={me.id} partnerName={partnerName} invitationConfirmed={invitationConfirmed(chat.messages, m.plan.invitationId)}
                    busy={s.planBusy === m.plan.proposalId} error={s.planError?.proposalId === m.plan.proposalId ? (s.planError.message ?? '') : undefined}
                    onAgree={() => void s.agreePlan(m.plan!)} onOpen={() => go(6)} t={t} rotate={i % 2 ? '1deg' : '-1deg'} />
                ) : null} />
            )
          })}
          {chat.partnerTyping && (
            <div className="msg" aria-live="polite" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#FFFFFF', borderRadius: '15px 15px 15px 4px', fontSize: '12px', color: '#6B6158' }}>
              <span>{partnerName} đang viết</span>
              <span aria-hidden="true" style={{ display: 'inline-flex', gap: '3px' }}>
                {[0, 1, 2].map((k) => <span key={k} className="dot" style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#9B7663', animationDelay: `${k * 0.2}s` }}></span>)}
              </span>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid #E6D8C5', padding: '8px 8px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {(pending || uploading) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', background: '#F3EBDD', border: '1px dashed #CDBBA3' }}>
              {pending && <img src={pending.preview} alt={t('c08.018')} style={{ width: '46px', height: '36px', objectFit: 'cover' }} />}
              <span style={{ flex: '1', fontSize: '12px', color: '#525B50' }}>{uploading ? 'Đang tải ảnh lên…' : t('c08.019')}</span>
              {pending && (
                <button type="button" onClick={s.clearPending} aria-label={t('c08.020')} style={{ width: '36px', height: '36px', border: '0', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#39342F" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              )}
            </div>
          )}
          {err && <span role="alert" style={{ fontSize: '12px', color: '#A8655A' }}>{err}</span>}
          {showEmoji && (
            <div role="group" aria-label={t('c08.021')} style={{ display: 'flex', flexWrap: 'wrap', gap: '0', background: '#F3EBDD', padding: '4px' }}>
              {EMOJIS.map(([ch, name]) => (
                <button key={ch} type="button" onClick={() => setText((x) => x + ch)} aria-label={name} style={{ width: '44px', height: '44px', border: '0', background: 'transparent', fontSize: '21px', cursor: 'pointer' }}>{ch}</button>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            <label aria-label={t('c08.022')} style={{ width: '42px', height: '44px', flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => void onFile(e)} style={srOnly} />
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#39342F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="1" /><circle cx="9" cy="10" r="1.6" /><path d="M21 16l-5-5-8 8" /></svg>
            </label>
            <button type="button" onClick={() => setShowEmoji((v) => !v)} aria-label={t('c08.021')} aria-expanded={showEmoji} style={{ width: '38px', height: '44px', flex: '0 0 auto', border: '0', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#39342F" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M8.5 14.5c1 1.3 2.2 2 3.5 2s2.5-.7 3.5-2" /><path d="M9 9.5h.01M15 9.5h.01" /></svg>
            </button>
            <label style={{ flex: '1', minWidth: '0', display: 'flex' }}>
              <span style={srOnly}>{t('c08.023')}</span>
              <input type="text" value={text} maxLength={4000} onChange={onText} onKeyDown={onKey} onBlur={() => chat.notifyTyping(false)} placeholder={`Viết gì đó cho ${partnerName}…`} style={{ flex: '1', minWidth: '0', minHeight: '44px', padding: '0 14px', border: '1px solid #E6D8C5', borderRadius: '999px', background: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#39342F' }} />
            </label>
            <button type="button" onClick={sendNow} disabled={!canSend} aria-label={t('c08.025')} style={{ width: '44px', height: '44px', flex: '0 0 auto', border: '0', borderRadius: '50%', background: '#39342F', opacity: canSend ? '1' : '.35', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FAF7F0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
            </button>
          </div>
          <span style={{ fontSize: '10px', lineHeight: '1.35', color: '#6B6158', textAlign: 'center' }}>
            {chat.connected ? `Tin nhắn được lưu lại và gửi ngay tới ${partnerName}.` : 'Đang kết nối lại… tin nhắn vẫn được lưu và sẽ tới nơi khi có mạng.'}
          </span>
        </div>

        {noteOpen && (
          <div style={{ position: 'absolute', inset: '0', zIndex: '10', background: 'rgba(57,52,47,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px', boxSizing: 'border-box' }}>
            <div className="fade" role="dialog" aria-modal="true" aria-label={t('c08.026')} style={{ position: 'relative', width: '100%', background: '#E6D8C5', padding: '24px 18px 16px', boxSizing: 'border-box', transform: 'rotate(-1deg)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '-10px', width: '76px', height: '20px', marginLeft: '-38px', background: 'rgba(250,247,240,.7)', transform: 'rotate(3deg)' }}></span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px' }}>{t('c08.008')}</span>
              <label style={{ display: 'flex' }}>
                <span style={srOnly}>{t('c08.027')}</span>
                <textarea rows={5} maxLength={NOTE_MAX} value={note} onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))} placeholder={`Một dòng nhỏ cho ${partnerName}…`} autoFocus style={{ flex: '1', resize: 'none', padding: '10px 12px', border: '0', background: '#FAF7F0', backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 27px, rgba(155,118,99,.2) 27px 28px)', lineHeight: '28px', fontFamily: "'Patrick Hand', cursive", fontSize: '18px', color: '#39342F' }}></textarea>
              </label>
              <span style={{ alignSelf: 'flex-end', fontSize: '11px', color: '#6B6158' }}>{note.length} / {NOTE_MAX}</span>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setNoteOpen(false)} style={{ minHeight: '44px', padding: '0 12px', border: '0', background: 'transparent', color: '#39342F', fontSize: '12px', letterSpacing: '.12em', cursor: 'pointer' }}>{t('c08.029')}</button>
                <button type="button" onClick={sendNote} disabled={!note.trim()} style={{ minHeight: '44px', padding: '0 16px', border: '0', borderRadius: '2px', background: '#39342F', color: '#FAF7F0', opacity: note.trim() ? '1' : '.35', fontFamily: "'Patrick Hand', cursive", fontSize: '17px', cursor: 'pointer' }}>{t('c08.030')}</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

type BubbleProps = { m: UiMessage; mine: boolean; index: number; showDay: boolean; day: string; read: boolean; noteLabel: string; onRetry: () => void; plan?: ReactNode }

function Bubble({ m, mine, index, showDay, day, read, noteLabel, onRetry, plan }: BubbleProps) {
  const d = new Date(m.createdAt)
  const rot = `${index % 2 ? 1.2 : -1.2}deg`
  const status = !mine ? '' : m.status === 'sending' ? ' · đang gửi…' : m.status === 'failed' ? '' : read ? ' · đã xem' : ' · đã gửi'
  return (
    <div className="msg" style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', gap: '3px', opacity: m.status === 'sending' ? 0.7 : 1 }}>
      {showDay && (
        <div style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: '10px', margin: '8px 0 2px' }}>
          <span style={{ flex: '1', height: '1px', background: '#E6D8C5' }}></span>
          <span style={{ fontSize: '9px', letterSpacing: '.24em', color: '#6B6158' }}>{day}</span>
          <span style={{ flex: '1', height: '1px', background: '#E6D8C5' }}></span>
        </div>
      )}
      {m.type === 'TEXT' && (
        <div style={{ maxWidth: '80%', padding: '9px 13px', background: mine ? '#525B50' : '#FFFFFF', color: mine ? '#FAF7F0' : '#39342F', borderRadius: mine ? '15px 15px 4px 15px' : '15px 15px 15px 4px', fontSize: '14.5px', lineHeight: '1.45', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          {m.content}
        </div>
      )}
      {m.type === 'IMAGE' && m.image && (
        <div style={{ width: '210px', maxWidth: '80%', background: '#FFFFFF', padding: '6px 6px 0', transform: `rotate(${rot})`, boxShadow: '0 10px 18px -10px rgba(57,52,47,.45)' }}>
          <a href={apiUrl(m.image.url)} target="_blank" rel="noreferrer">
            <img src={apiUrl(m.image.url)} alt={m.content ?? 'Ảnh'} loading="lazy" width={m.image.width ?? undefined} height={m.image.height ?? undefined} style={{ display: 'block', width: '100%', height: 'auto', maxHeight: '260px', objectFit: 'cover' }} />
          </a>
          <p style={{ margin: '0', padding: '5px 2px 8px', fontFamily: "'Patrick Hand', cursive", fontSize: '15px', color: '#525B50', minHeight: '6px' }}>{m.content}</p>
        </div>
      )}
      {m.type === 'NOTE' && (
        <div style={{ position: 'relative', width: '240px', maxWidth: '86%', background: '#E6D8C5', padding: '16px 16px 12px', boxSizing: 'border-box', transform: `rotate(${rot})`, boxShadow: '0 10px 18px -10px rgba(57,52,47,.4)' }}>
          <span aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '-8px', width: '56px', height: '16px', marginLeft: '-28px', background: 'rgba(250,247,240,.7)', transform: 'rotate(3deg)' }}></span>
          <span style={{ display: 'block', fontSize: '8px', letterSpacing: '.26em', color: '#9B7663', marginBottom: '4px' }}>{noteLabel}</span>
          <span style={{ display: 'block', fontFamily: "'Patrick Hand', cursive", fontSize: '17px', lineHeight: '1.4', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{m.content}</span>
        </div>
      )}
      {plan}
      <span style={{ fontSize: '10px', color: m.status === 'failed' ? '#A8655A' : '#6B6158' }}>
        {pad(d.getHours())}:{pad(d.getMinutes())}
        {status}
        {m.status === 'failed' && (
          <>
            {' · '}
            {m.error ?? 'chưa gửi được'}{' '}
            <button type="button" onClick={onRetry} style={{ border: '0', background: 'transparent', color: '#A8655A', textDecoration: 'underline', fontSize: '10px', cursor: 'pointer', padding: '0' }}>
              thử lại
            </button>
          </>
        )}
      </span>
    </div>
  )
}
