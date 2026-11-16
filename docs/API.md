# API

Interactive documentation: `http://localhost:8080/swagger-ui.html` (local profile; disabled in
prod unless `API_DOCS_ENABLED=true`). Raw spec: `/v3/api-docs`.

All endpoints except `GET /api/auth/csrf`, `POST /api/auth/login` and `GET /api/health` require
the session cookie. Every `POST`/`PUT`/`DELETE` needs the header returned by `/api/auth/csrf`
(`X-CSRF-TOKEN`). Errors are JSON: `{timestamp,status,code,message,fieldErrors}`.

| Method | Path | Notes |
|--------|------|-------|
| GET  | `/api/auth/csrf` | `{headerName, token}`; call again after login/logout (token rotates) |
| POST | `/api/auth/login` | `{username,password}` → user; 401 wrong credentials; 429 after 5 failures |
| POST | `/api/auth/logout` | 204, invalidates the session |
| GET  | `/api/auth/me` | current user or 401 |
| GET  | `/api/conversations` | members (+online, lastReadMessageId), lastMessage, unreadCount |
| GET  | `/api/conversations/{id}/messages?before=&limit=` | newest page first (limit ≤ 100), each page oldest→newest, `hasMore` |
| POST | `/api/conversations/{id}/messages` | `{clientMessageId(UUID), type: TEXT\|IMAGE\|NOTE, content, imageId}`; idempotent per UUID |
| PUT  | `/api/conversations/{id}/read` | `{lastReadMessageId}`; only moves forward |
| POST | `/api/uploads/images` | multipart field `file`; JPEG/PNG/WebP ≤ 10 MB → `{id,url,contentType,sizeBytes,width,height}` |
| GET  | `/api/images/{id}` | bytes; only uploader or people sharing a conversation with them |
| POST | `/api/invitations` | `{message?}` → invites the other member (409 if one is already open) |
| GET  | `/api/invitations` | invitations you sent or received, with proposals |
| POST | `/api/invitations/{id}/proposals` | `{proposedDate, timeSlot, specificTime?, activity, location?, note?}` |
| POST | `/api/invitations/{id}/proposals/{proposalId}/agree` | confirms when both agreed to the same proposal |
| POST | `/api/invitations/{id}/response` | invitee only: `{response: ACCEPTED\|THINKING}` |
| GET  | `/api/story` | private `story.json` (see STORY_CONTENT.md) |
| GET  | `/api/story/assets/{file}` | photos referenced by `story.json` |
| GET  | `/api/health` | `{status:"UP"}` |

## WebSocket (STOMP)

Endpoint: `/ws` (plain WebSocket, no SockJS). The handshake needs the session cookie and an
`Origin` from `CORS_ALLOWED_ORIGINS`.

| Direction | Destination | Payload |
|-----------|-------------|---------|
| send      | `/app/chat.send` | `{conversationId, clientMessageId, type, content?, imageId?}` |
| send      | `/app/chat.typing` | `{conversationId, typing}` |
| subscribe | `/topic/conversations/{conversationId}` | `{type: MESSAGE\|TYPING\|READ\|PRESENCE, conversationId, payload}` (members only) |
| subscribe | `/user/queue/errors` | `{code, message, clientMessageId}` — only for your own failed sends |

Subscribing to a conversation you are not a member of closes the STOMP session.
