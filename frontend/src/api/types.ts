// Shapes returned by the Spring Boot API (see backend DTOs / Swagger).

export type User = { id: number; username: string; displayName: string }

/** PLAN messages are created by the server from a date suggestion; clients never send them. */
export type MessageType = 'TEXT' | 'IMAGE' | 'NOTE' | 'PLAN'

export type ImageInfo = {
  id: string
  url: string
  contentType: string
  sizeBytes: number
  width: number | null
  height: number | null
}

export type ChatMessage = {
  id: number
  conversationId: number
  senderId: number
  senderName: string
  type: MessageType
  content: string | null
  image: ImageInfo | null
  clientMessageId: string
  createdAt: string
  /** Set on PLAN messages: the proposal's CURRENT state (who agreed, confirmed). */
  plan?: PlanInfo | null
}

export type PlanInfo = {
  invitationId: number
  proposalId: number
  activity: string
  proposedDate: string
  timeSlot: TimeSlot
  specificTime: string | null
  location: string | null
  note: string | null
  proposerName: string
  inviterId: number
  inviteeId: number
  inviterAgreed: boolean
  inviteeAgreed: boolean
  confirmed: boolean
}

export type Member = {
  userId: number
  username: string
  displayName: string
  online: boolean
  lastReadMessageId: number | null
}

export type Conversation = {
  id: number
  title: string
  members: Member[]
  lastMessage: ChatMessage | null
  unreadCount: number
}

export type MessagePage = { messages: ChatMessage[]; hasMore: boolean }

export type ChatEvent =
  | { type: 'MESSAGE'; conversationId: number; payload: ChatMessage }
  | { type: 'TYPING'; conversationId: number; payload: { userId: number; displayName: string; typing: boolean } }
  | { type: 'READ'; conversationId: number; payload: { userId: number; lastReadMessageId: number | null } }
  | { type: 'PRESENCE'; conversationId: number; payload: { userId: number; online: boolean } }

export type ChatError = { code: string; message: string; clientMessageId: string | null }

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'THINKING'
export type TimeSlot = 'MORNING' | 'AFTERNOON' | 'EVENING'

export type Proposal = {
  id: number
  proposerId: number
  proposerName: string
  proposedDate: string
  timeSlot: TimeSlot
  specificTime: string | null
  activity: string
  location: string | null
  note: string | null
  inviterAgreed: boolean
  inviteeAgreed: boolean
  agreedByMe: boolean
  confirmed: boolean
  createdAt: string
}

export type Invitation = {
  id: number
  inviter: User
  invitee: User
  message: string | null
  status: InvitationStatus
  confirmedProposalId: number | null
  respondedAt: string | null
  confirmedAt: string | null
  createdAt: string
  proposals: Proposal[]
}
