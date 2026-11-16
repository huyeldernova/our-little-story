import { Client, type IMessage } from '@stomp/stompjs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { chatApi } from '../api/endpoints'
import { ApiError, ensureCsrf, wsUrl } from '../api/http'
import type { ChatError, ChatEvent, ChatMessage, Conversation, ImageInfo, MessageType } from '../api/types'
import { propagatePlan } from './plans'

export type UiMessage = ChatMessage & { status: 'sent' | 'sending' | 'failed'; error?: string }

export function newClientId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  // Fallback for non-secure contexts (e.g. testing over a LAN IP)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export function upsert(list: UiMessage[], incoming: UiMessage[]): UiMessage[] {
  const byClient = new Map(list.map((m) => [m.clientMessageId, m]))
  for (const m of incoming) byClient.set(m.clientMessageId, m)
  return [...byClient.values()].sort((a, b) => {
    // Pending messages (id < 0) stay at the bottom in send order.
    if (a.id < 0 && b.id < 0) return b.id - a.id
    if (a.id < 0) return 1
    if (b.id < 0) return -1
    return a.id - b.id
  })
}

type Options = { myId: number; active: boolean }

/**
 * Real-time chat over STOMP with REST fallbacks:
 * history + pagination via REST, live events via /topic/conversations/{id},
 * automatic reconnection (stompjs reconnectDelay), idempotent retries with the
 * same clientMessageId, typing indicator, read receipts and real presence.
 */
export function useChat({ myId, active }: Options) {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [connected, setConnected] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [online, setOnline] = useState<Record<number, boolean>>({})
  const [readMarks, setReadMarks] = useState<Record<number, number>>({})
  const [typing, setTyping] = useState<Record<number, number>>({})
  const clientRef = useRef<Client | null>(null)
  const pendingTimers = useRef(new Map<string, number>())
  const lastTypingSent = useRef(0)
  const lastReadSent = useRef(0)
  const seq = useRef(-1)

  const convId = conversation?.id

  // Initial load: conversation + newest page.
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const list = await chatApi.conversations()
        const c = list[0]
        if (!alive) return
        if (!c) {
          setLoadError('Chưa có cuộc trò chuyện nào.')
          return
        }
        setConversation(c)
        setOnline(Object.fromEntries(c.members.map((m) => [m.userId, m.online])))
        setReadMarks(Object.fromEntries(c.members.map((m) => [m.userId, m.lastReadMessageId ?? 0])))
        const page = await chatApi.history(c.id)
        if (!alive) return
        setMessages(page.messages.map((m) => ({ ...m, status: 'sent' })))
        setHasMore(page.hasMore)
      } catch (e) {
        if (alive) setLoadError(e instanceof ApiError ? e.message : 'Không tải được cuộc trò chuyện.')
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const handleEvent = useCallback(
    (frame: IMessage) => {
      const ev = JSON.parse(frame.body) as ChatEvent
      switch (ev.type) {
        case 'MESSAGE': {
          const m = ev.payload
          const timer = pendingTimers.current.get(m.clientMessageId)
          if (timer) {
            window.clearTimeout(timer)
            pendingTimers.current.delete(m.clientMessageId)
          }
          setMessages((list) => {
            const next = upsert(list, [{ ...m, status: 'sent' }])
            // A new PLAN card carries the proposal's latest state: update its older cards too.
            return m.type === 'PLAN' && m.plan ? propagatePlan(next, m.plan) : next
          })
          setTyping((t) => ({ ...t, [m.senderId]: 0 }))
          break
        }
        case 'TYPING':
          if (ev.payload.userId !== myId) {
            setTyping((t) => ({ ...t, [ev.payload.userId]: ev.payload.typing ? Date.now() : 0 }))
          }
          break
        case 'READ':
          setReadMarks((r) => ({ ...r, [ev.payload.userId]: ev.payload.lastReadMessageId ?? 0 }))
          break
        case 'PRESENCE':
          setOnline((o) => ({ ...o, [ev.payload.userId]: ev.payload.online }))
          break
      }
    },
    [myId],
  )

  // STOMP connection with automatic reconnect.
  useEffect(() => {
    if (!convId) return
    const client = new Client({
      brokerURL: wsUrl(),
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      beforeConnect: async () => {
        // Refresh the CSRF token/session cookie before each (re)connect attempt.
        await ensureCsrf().catch(() => undefined)
      },
      onConnect: () => {
        setConnected(true)
        client.subscribe(`/topic/conversations/${convId}`, handleEvent)
        client.subscribe('/user/queue/errors', (f) => {
          const err = JSON.parse(f.body) as ChatError
          if (err.clientMessageId) {
            const id = err.clientMessageId
            window.clearTimeout(pendingTimers.current.get(id))
            pendingTimers.current.delete(id)
            setMessages((list) => list.map((m) => (m.clientMessageId === id ? { ...m, status: 'failed', error: err.message } : m)))
          }
        })
        // Catch up on anything sent while we were disconnected.
        chatApi
          .history(convId)
          .then((page) => setMessages((list) => upsert(list, page.messages.map((m) => ({ ...m, status: 'sent' })))))
          .catch(() => undefined)
        chatApi
          .conversations()
          .then((list) => {
            const c = list.find((x) => x.id === convId)
            if (c) setOnline(Object.fromEntries(c.members.map((m) => [m.userId, m.online])))
          })
          .catch(() => undefined)
      },
      onWebSocketClose: () => setConnected(false),
      onStompError: () => setConnected(false),
    })
    clientRef.current = client
    client.activate()
    return () => {
      clientRef.current = null
      void client.deactivate()
    }
  }, [convId, handleEvent])

  // Typing indicators expire after a few seconds without updates.
  useEffect(() => {
    const id = window.setInterval(() => {
      setTyping((t) => {
        const now = Date.now()
        let changed = false
        const next: Record<number, number> = {}
        for (const [k, v] of Object.entries(t)) {
          const keep = v && now - v < 6000 ? v : 0
          if (keep !== v) changed = true
          next[Number(k)] = keep
        }
        return changed ? next : t
      })
    }, 1500)
    return () => window.clearInterval(id)
  }, [])

  const deliver = useCallback(
    async (m: UiMessage) => {
      if (!convId) return
      const body = { clientMessageId: m.clientMessageId, type: m.type, content: m.content, imageId: m.image?.id ?? null }
      const client = clientRef.current
      const viaRest = async () => {
        try {
          const saved = await chatApi.send(convId, body)
          setMessages((list) => upsert(list, [{ ...saved, status: 'sent' }]))
        } catch (e) {
          setMessages((list) =>
            list.map((x) =>
              x.clientMessageId === m.clientMessageId
                ? { ...x, status: 'failed', error: e instanceof ApiError ? e.message : 'Chưa gửi được.' }
                : x,
            ),
          )
        }
      }
      if (client?.connected) {
        client.publish({ destination: '/app/chat.send', body: JSON.stringify({ conversationId: convId, ...body }) })
        // If the echo doesn't arrive, retry over REST (safe: same clientMessageId).
        pendingTimers.current.set(
          m.clientMessageId,
          window.setTimeout(() => {
            pendingTimers.current.delete(m.clientMessageId)
            void viaRest()
          }, 8000),
        )
      } else {
        await viaRest()
      }
    },
    [convId],
  )

  const send = useCallback(
    (type: MessageType, content: string | null, image: ImageInfo | null = null) => {
      if (!convId) return
      const m: UiMessage = {
        id: seq.current--,
        conversationId: convId,
        senderId: myId,
        senderName: '',
        type,
        content,
        image,
        clientMessageId: newClientId(),
        createdAt: new Date().toISOString(),
        status: 'sending',
      }
      setMessages((list) => upsert(list, [m]))
      void deliver(m)
    },
    [convId, myId, deliver],
  )

  const retry = useCallback(
    (clientMessageId: string) => {
      const m = messages.find((x) => x.clientMessageId === clientMessageId)
      if (!m) return
      const again = { ...m, status: 'sending' as const, error: undefined }
      setMessages((list) => upsert(list, [again]))
      void deliver(again)
    },
    [messages, deliver],
  )

  const loadOlder = useCallback(async () => {
    if (!convId || loadingOlder || !hasMore) return
    const oldest = messages.find((m) => m.id > 0)
    if (!oldest) return
    setLoadingOlder(true)
    try {
      const page = await chatApi.history(convId, oldest.id)
      setMessages((list) => upsert(list, page.messages.map((m) => ({ ...m, status: 'sent' }))))
      setHasMore(page.hasMore)
    } finally {
      setLoadingOlder(false)
    }
  }, [convId, loadingOlder, hasMore, messages])

  const notifyTyping = useCallback(
    (isTyping: boolean) => {
      const client = clientRef.current
      if (!convId || !client?.connected) return
      const now = Date.now()
      if (isTyping && now - lastTypingSent.current < 2500) return
      lastTypingSent.current = isTyping ? now : 0
      client.publish({ destination: '/app/chat.typing', body: JSON.stringify({ conversationId: convId, typing: isTyping }) })
    },
    [convId],
  )

  // Read receipts: when the chat is visible, mark the newest message from the other person as read.
  const newestFromOther = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i]
      if (m.id > 0 && m.senderId !== myId) return m.id
    }
    return 0
  }, [messages, myId])

  useEffect(() => {
    if (!convId || !active || !newestFromOther) return
    if (newestFromOther <= Math.max(lastReadSent.current, readMarks[myId] ?? 0)) return
    if (document.visibilityState !== 'visible') return
    lastReadSent.current = newestFromOther
    chatApi
      .markRead(convId, newestFromOther)
      .then((r) => setReadMarks((m) => ({ ...m, [myId]: r.lastReadMessageId })))
      .catch(() => {
        lastReadSent.current = 0
      })
  }, [convId, active, newestFromOther, readMarks, myId])

  /** Local update of loaded messages (used to refresh PLAN cards after agreeing). */
  const patchMessages = useCallback((fn: (list: UiMessage[]) => UiMessage[]) => setMessages(fn), [])

  const partner = conversation?.members.find((m) => m.userId !== myId) ?? null

  return {
    conversation,
    partner,
    messages,
    hasMore,
    loadingOlder,
    loadOlder,
    connected,
    loadError,
    partnerOnline: partner ? !!online[partner.userId] : false,
    partnerTyping: partner ? !!typing[partner.userId] : false,
    partnerReadUpTo: partner ? (readMarks[partner.userId] ?? 0) : 0,
    send,
    retry,
    notifyTyping,
    patchMessages,
  }
}
