# Test report

Run on 17 Nov 2026 in a Linux sandbox: OpenJDK 21.0.12, Maven 3.9.11, Node 22.23, MySQL 8.0.46,
Chromium (Playwright) for the browser tests. Everything below was actually executed; nothing is
assumed.

## Backend — `mvn test` (38 tests, 0 failures)

The same suite was run twice: on H2 (MySQL mode, default) and on a real **MySQL 8.0.46** database
(`TEST_DB_URL=…/ols_test`). Both: **38 passed, 0 failed, 0 errors**. Flyway `V1__init.sql`
applies cleanly on both and Hibernate `ddl-auto=validate` passes.

| Class | Tests | Covers |
|-------|------:|--------|
| `AuthIntegrationTest` | 8 | 401 without session; login refused without CSRF; wrong password; session id + CSRF rotation on login; `/me`; logout invalidates session; lockout after 5 failures (429); BCrypt cost 12; no registration endpoint |
| `ChatIntegrationTest` | 9 | conversation list (members, unread count, last message); duplicate `clientMessageId` stored once; keyset pagination; validation (empty, too long, bad UUID, missing image); NOTE type; IMAGE only with your own upload; read marker only moves forward; outsiders get 404; anonymous 401 |
| `StompIntegrationTest` | 4 | real server + real WebSocket clients: presence online/offline, live MESSAGE to both users, persisted before broadcast, TYPING, errors only to sender with `clientMessageId`, forbidden SUBSCRIBE closes the session, handshake needs session cookie and allowed Origin |
| `ImageIntegrationTest` | 5 | JPEG/PNG/WebP accepted with dimensions; UUID storage key, sanitised original name; HTML/GIF disguised as images rejected (415); truncated PNG rejected; > 10 MB rejected (413); download for members only, `nosniff`, private cache; CSRF + login required |
| `ImageValidatorTest` | 4 | magic-number detection, WebP header parsing, absurd dimensions, empty input |
| `InvitationIntegrationTest` | 5 | only invitee answers; THINKING → ACCEPTED; one open invitation; confirmation only when both agree to the same proposal; nothing can change after confirmation; date/slot/time validation; outsiders get 404 |
| `StoryIntegrationTest` | 3 | story + assets require login; served to members; path traversal blocked |

## Frontend

- `npm run build` (TypeScript 7 type-check + Vite production build): **passed**.
- `npm test` (Vitest): **4 passed** (message de-duplication/ordering, client UUID format).
- `npm run lint` (oxlint): 0 errors, 3 warnings (fast-refresh export hints and one
  set-state-in-effect hint; harmless).
- The production bundle was searched for personal names and file names: none present.

## End-to-end — `scripts/e2e_smoke.py` (21 + 2 checks, 0 failures)

Real backend (`java -jar`, profile local) + real MySQL + `npm run dev`, two Chromium contexts:
user1 on a 1440×900 desktop, user2 on a 390×844 touch phone. Fresh database.

Passed: redirect to login · wrong password message · both logins · cover opens · paging through
all 8 chapters · swipe to next chapter · photo viewer · press-and-hold wax seal + letter out ·
invitee accepts → ticket · invitee sends a proposal · ticket stays "Waiting to be written" until
the other person agrees · confirmed after both agreed · presence online · typing indicator ·
message user2→user1 · message user1→user2 · read receipt "đã xem" · image upload and delivery ·
note delivery · logout.

Then the backend process was **restarted** and `--phase persist` passed: messages and the image
message are still there after reload.

Responsive layouts were checked from screenshots at 390×844 (all chapters, letter open, invitation,
chat, photo viewer) and 1440×900 (cover, chapter 03, letter, invitation, chat). Screenshots contain
private photos, so they are not part of the repository.

## Not tested

- `S3ImageStorage` against a real bucket (no AWS used).
- Deployment to EC2 / RDS / Vercel.
- Music playback: the sandbox browser blocks YouTube, so only the "unavailable / tap to play"
  states were exercised; the player code follows the earlier standalone player.
- Safari / Firefox / real phones (only Chromium was available).
