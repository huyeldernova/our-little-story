# Architecture

A modular monolith: one Spring Boot application, one React single-page app, one MySQL database.

```
Browser ──HTTPS──► Vercel (static React build)
   │
   ├── fetch /api/**  (session cookie + X-CSRF-TOKEN) ──► Spring Boot on EC2 ──► MySQL (RDS)
   ├── WebSocket /ws  (STOMP, session cookie, Origin allow-list) ─┘        └──► images: disk or S3
   └── <iframe> YouTube embedded player (music only)
```

## Backend packages (`com.ourlittlestory`)

| Package      | Responsibility |
|--------------|----------------|
| `auth`       | Login/logout/me/csrf endpoints, BCrypt user lookup, brute-force guard, first-start account bootstrap |
| `user`       | `User` entity, repository, `UserDto` (never exposes the hash) |
| `chat`       | Conversations, members (read markers), messages; REST controller; STOMP controller; frame authorisation; presence; broadcaster |
| `image`      | Upload validation (magic bytes + header parse), `ImageStorage` interface with `LocalImageStorage` and `S3ImageStorage`, authenticated download |
| `invitation` | Invitations (PENDING/ACCEPTED/THINKING), proposals, mutual agreement |
| `story`      | Serves the private `story.json` and its photos to signed-in users (keeps personal content out of the public repo) |
| `config`     | Security, WebSocket, OpenAPI, typed `app.*` properties, health endpoint |
| `common`     | `ApiException`, JSON error body, global exception handler |

Layers: Controller → Service → Repository → Entity. Controllers only return DTO records.

## Key flows

**Login.** `GET /api/auth/csrf` → `POST /api/auth/login` (CSRF header). The server authenticates
with BCrypt, rotates the session id (fixation protection), stores the `SecurityContext` in the
HTTP session (`OLS_SESSION`, HttpOnly, SameSite=Lax, Secure in prod) and rotates the CSRF token.

**Sending a message.**
1. Client generates a UUID `clientMessageId` and shows the bubble as "đang gửi…".
2. STOMP `SEND /app/chat.send` (or `POST /api/conversations/{id}/messages` when offline).
3. Server checks the session user and conversation membership, validates the payload.
4. Inside a transaction it inserts the row (unique `(sender_id, client_message_id)`), or returns
   the existing row if this UUID was already stored (retry / reconnect).
5. **After the commit** it publishes `{type:"MESSAGE"}` to `/topic/conversations/{id}`.
6. The recipient (if connected) receives it; otherwise it is loaded from history later.
   If the sender doesn't see the echo within 8 s it retries over REST with the same UUID.

**Presence / typing / read receipts** use the same topic with `PRESENCE`, `TYPING`, `READ` events.
Presence is computed from real STOMP sessions (connect/disconnect events). Read receipts move
`conversation_members.last_read_message_id` forward only.

**Invitation.** Created at bootstrap (user1 → user2). The invitee answers `ACCEPTED` or `THINKING`.
Either person adds proposals (date, MORNING/AFTERNOON/EVENING, optional exact time inside the
slot, activity, location, note). Proposing counts as the proposer's agreement; a proposal and the
invitation are **confirmed only when both people agreed to that same proposal**. Accepting the card
alone schedules nothing.

## Database

See `backend/src/main/resources/db/migration/V1__init.sql`. Tables: `users`, `conversations`,
`conversation_members`, `messages`, `stored_images`, `date_invitations`, `date_proposals`
(+ Flyway's history table). All timestamps are `DATETIME(6)` in UTC; Hibernate runs with
`ddl-auto=validate` so the entities must match the migrations.

## Frontend structure

| Folder      | Contents |
|-------------|----------|
| `api/`      | `fetch` wrapper (credentials + CSRF), endpoint functions, response types |
| `auth/`     | `AuthProvider` (`/api/auth/me` on load) |
| `story/`    | Loads `story.json` after login; `t(key)` for texts, `asset(file)` for photos |
| `music/`    | YouTube IFrame player provider above the router → keeps playing across chapters |
| `layout/`   | The book: progress, header, swipe/tap/keyboard navigation, chapter sheet, photo viewer |
| `chapters/` | The eight chapters, ported from the Claude Design "Mobile story mode" canvas |
| `chat/`     | `useChat` hook: history, pagination, STOMP, reconnect, retries, typing, receipts |
| `pages/`    | Login page |

The chapter markup was converted from the design file with a small script that moved every
human-readable string into `story.json` keys (`c01.001` …) and every photo into `asset('…')`
calls, so the public bundle contains layout and styling only.
