import { describe, expect, it } from 'vitest'
import { newClientId, upsert, type UiMessage } from './useChat'

const msg = (id: number, clientMessageId: string, status: UiMessage['status'] = 'sent'): UiMessage => ({
  id,
  conversationId: 1,
  senderId: 1,
  senderName: 'A',
  type: 'TEXT',
  content: 'x' + id,
  image: null,
  clientMessageId,
  createdAt: new Date(0).toISOString(),
  status,
})

describe('upsert', () => {
  it('replaces an optimistic message with the stored one (same clientMessageId)', () => {
    const pending = msg(-1, 'c1', 'sending')
    const list = upsert([msg(5, 'a'), pending], [msg(9, 'c1')])
    expect(list.map((m) => m.id)).toEqual([5, 9])
    expect(list[1].status).toBe('sent')
  })

  it('never duplicates a message delivered twice (WebSocket echo + REST retry)', () => {
    const list = upsert(upsert([], [msg(3, 'c3')]), [msg(3, 'c3')])
    expect(list).toHaveLength(1)
  })

  it('orders stored messages by id and keeps pending ones last, in send order', () => {
    const list = upsert([], [msg(-2, 'p2', 'sending'), msg(7, 'b'), msg(-1, 'p1', 'sending'), msg(2, 'a')])
    expect(list.map((m) => m.clientMessageId)).toEqual(['a', 'b', 'p1', 'p2'])
  })
})

describe('newClientId', () => {
  it('produces RFC 4122 v4 UUIDs accepted by the backend', () => {
    for (let i = 0; i < 20; i++) {
      expect(newClientId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    }
  })
})
