import { api, resetCsrf } from './http'
import type { Conversation, ChatMessage, ImageInfo, Invitation, MessagePage, MessageType, TimeSlot, User } from './types'

export const authApi = {
  me: () => api<User>('/api/auth/me'),
  login: async (username: string, password: string) => {
    const user = await api<User>('/api/auth/login', { method: 'POST', body: { username, password } })
    resetCsrf() // the server rotates the CSRF token on login
    return user
  },
  logout: async () => {
    try {
      await api<void>('/api/auth/logout', { method: 'POST' })
    } finally {
      resetCsrf()
    }
  },
}

export const chatApi = {
  conversations: () => api<Conversation[]>('/api/conversations'),
  history: (conversationId: number, before?: number, limit = 30) =>
    api<MessagePage>(
      `/api/conversations/${conversationId}/messages?limit=${limit}` + (before ? `&before=${before}` : ''),
    ),
  send: (
    conversationId: number,
    body: { clientMessageId: string; type: MessageType; content?: string | null; imageId?: string | null },
  ) => api<ChatMessage>(`/api/conversations/${conversationId}/messages`, { method: 'POST', body }),
  markRead: (conversationId: number, lastReadMessageId: number) =>
    api<{ userId: number; lastReadMessageId: number }>(`/api/conversations/${conversationId}/read`, {
      method: 'PUT',
      body: { lastReadMessageId },
    }),
  uploadImage: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api<ImageInfo>('/api/uploads/images', { method: 'POST', form })
  },
}

export type NewProposal = {
  proposedDate: string
  timeSlot: TimeSlot
  specificTime?: string | null
  activity: string
  location?: string | null
  note?: string | null
}

export const invitationApi = {
  list: () => api<Invitation[]>('/api/invitations'),
  create: (message?: string) => api<Invitation>('/api/invitations', { method: 'POST', body: { message } }),
  respond: (id: number, response: 'ACCEPTED' | 'THINKING') =>
    api<Invitation>(`/api/invitations/${id}/response`, { method: 'POST', body: { response } }),
  propose: (id: number, body: NewProposal) =>
    api<Invitation>(`/api/invitations/${id}/proposals`, { method: 'POST', body }),
  agree: (id: number, proposalId: number) =>
    api<Invitation>(`/api/invitations/${id}/proposals/${proposalId}/agree`, { method: 'POST' }),
}

export const storyApi = {
  load: () => api<unknown>('/api/story'),
}

export const adminApi = {
  /** Whether the signed-in user is the story author (may upload the story content). */
  status: () => api<{ admin: boolean }>('/api/admin/status'),
  /** Replaces the private story content with a .zip (story.json + assets/). Author only. */
  uploadStory: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api<{ files: number; assets: number }>('/api/admin/story', { method: 'POST', form })
  },
}
