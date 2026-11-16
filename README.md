# Our Little Story

A private scrapbook website for two people: eight story chapters in a vintage-scrapbook
style, background music, and a private real-time chat and date-invitation corner.

- **Frontend** — React 19 + TypeScript + Vite + Tailwind CSS 4 + React Router + `@stomp/stompjs` (deploy: Vercel)
- **Backend** — Java 21, Spring Boot 3.5 (Web, Data JPA, Security, WebSocket/STOMP, Validation), SpringDoc OpenAPI, Maven (deploy: AWS EC2)
- **Database** — MySQL 8 with Flyway migrations (production: AWS RDS)
- **Images** — local disk by default, S3 implementation ready behind a setting

```
our-little-story/
├── backend/            Spring Boot app (packages: auth, user, chat, image, invitation, story, config, common)
├── frontend/           React app (chapters/, layout/, chat/, music/, api/, auth/, story/, pages/)
├── story-example/      Placeholder story.json + placeholder images (safe to publish)
├── docs/               Architecture, API, deployment, story content, test report
├── scripts/            create-local-db.sql, e2e_smoke.py (two-browser end-to-end test)
├── .env.example        Backend environment variables (copy to .env, never commit .env)
└── docker-compose.yml  OPTIONAL MySQL container — not needed if MySQL is installed
```

> **Privacy.** The repository is public, so it contains **no** real texts, photos, names or
> passwords. The real story (letters, chat transcript, captions, photos) lives in a private
> folder on the server (`OLS_STORY_DIR`) and is served only to signed-in users through
> `GET /api/story`. Without it the app shows the placeholder story from `story-example/`.
> See [docs/STORY_CONTENT.md](docs/STORY_CONTENT.md).

---

## 1. Required software

| Tool    | Version                    | Check            |
|---------|----------------------------|------------------|
| Java    | 21 (LTS)                   | `java -version`  |
| Maven   | 3.9+                       | `mvn -v`         |
| Node.js | 22 or 24 (with npm)        | `node -v`        |
| MySQL   | 8.0 / 8.4                  | `mysql --version`|

Docker is **not** required. No AWS account is needed to run locally.

## 2. Configure MySQL

Any MySQL 8 server on `localhost:3306` works. The schema uses `utf8mb4` (emoji and Vietnamese)
and stores all timestamps in UTC; Flyway creates every table on first start.

## 3. Create the local database

Edit the placeholder password in `scripts/create-local-db.sql`, then:

```bash
mysql -u root -p < scripts/create-local-db.sql
```

This creates the database `our_little_story`, the user `ols_app`, and an optional `ols_test`
database for running the test-suite against MySQL.

## 4. Configure environment variables

```bash
cp .env.example .env          # .env is git-ignored
# edit .env: DB_PASSWORD, both account passwords (≥ 10 chars), OLS_STORY_DIR
```

The backend reads `.env` from the repo root by itself (`spring.config.import` in
`application.yml`, works whether it is started from `backend/` or the repo root, including
IntelliJ's Run button). No command is needed to load the variables. Real environment
variables, if set, still take precedence. `DB_URL` contains `createDatabaseIfNotExist=true`,
so the database `our_little_story` is created automatically if it does not exist.

Frontend: nothing is needed for development. `frontend/.env.example` documents
`VITE_API_BASE_URL` for production.

## 5. Run the backend

```bash
cd backend
mvn spring-boot:run            # profile "local" is the default → http://localhost:8080
```

`.env` is picked up automatically (see step 4); no environment setup in the shell is required.

- Health check: http://localhost:8080/api/health
- Swagger UI (local profile only): http://localhost:8080/swagger-ui.html

## 6. Run the frontend

```bash
cd frontend
npm install
npm run dev                    # http://localhost:5173
```

Vite proxies `/api` and `/ws` to `localhost:8080`, so the browser only talks to one origin
and the session cookie stays first-party.

## 7. Create the two initial accounts

There is no sign-up page. On the **first** start with an empty `users` table the backend reads
`OLS_USER1_*` and `OLS_USER2_*` from the environment, stores BCrypt hashes, creates the
shared conversation, and creates the pending date invitation from user1 to user2.
Look for this log line:

```
Created the two accounts 'author' and 'guest' and their conversation.
```

If the variables are missing the backend starts but logs a warning and nobody can log in.
To change passwords later: put the new values in `.env`, start once with
`OLS_RESET_PASSWORDS=true`, then set it back to `false`.

Avatars in the chat header come from `avatars` in `story.json`, keyed by **username**.

## 8. Test the chat

1. Open http://localhost:5173 in a normal window and log in as user1.
2. Open it in a private/incognito window (or another browser) and log in as user2.
3. In both, go to chapter **08 · Our Little Chat** (header arrows, swipe, or the chapter list).
4. You should see: the other person's **online** status, "… đang viết" while typing,
   messages arriving instantly, "đã xem" under your message once the other side has seen it,
   and "Leave a little note" notes.
5. Stop the backend, send a message (it shows "đang kết nối lại…"), start the backend:
   the client reconnects and the message is delivered once (no duplicates thanks to the
   client message UUID).
6. Restart the backend and reload: history is still there (MySQL).

## 9. Test image uploads

In the chat, click the picture icon and choose a JPEG, PNG or WebP (≤ 10 MB), add an optional
caption, and send. Files are checked by their **content** (magic bytes + header parsing), renamed
to a random UUID, stored under `UPLOAD_DIR`, and served only to signed-in members via
`GET /api/images/{id}`. Try renaming a `.txt` to `.jpg` — the upload is refused.

With curl:

```bash
curl -c jar -b jar http://localhost:8080/api/auth/csrf            # → {"headerName":"X-CSRF-TOKEN","token":"…"}
curl -c jar -b jar -H 'X-CSRF-TOKEN: <token>' -H 'Content-Type: application/json' \
     -d '{"username":"author","password":"…"}' http://localhost:8080/api/auth/login
curl -c jar -b jar http://localhost:8080/api/auth/csrf            # token rotates after login
curl -b jar -H 'X-CSRF-TOKEN: <new token>' -F file=@photo.jpg http://localhost:8080/api/uploads/images
```

## 10. Run the backend tests

```bash
cd backend
mvn test                                         # in-memory H2 (MySQL mode), no setup needed
# the same 38 tests against real MySQL 8:
TEST_DB_URL='jdbc:mysql://localhost:3306/ols_test?connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true' \
TEST_DB_USERNAME=ols_app TEST_DB_PASSWORD='…' mvn test
```

Frontend unit tests: `cd frontend && npm test`.
Two-browser end-to-end test (needs both apps running + `pip install playwright && playwright install chromium`):
see the header of `scripts/e2e_smoke.py`. Latest results: [docs/TEST_REPORT.md](docs/TEST_REPORT.md).

## 11. Build the frontend

```bash
cd frontend
npm run build      # type-checks, then writes dist/
npm run preview    # serves dist/ locally
```

Backend jar: `cd backend && mvn package` → `target/our-little-story-backend-1.0.0.jar`
(`java -jar … --spring.profiles.active=prod`).

## 12. Known limitations

- **Desktop layout**: chapters are one responsive implementation based on the mobile "story mode"
  design. On wide screens the page is shown as a book on a dark desk (max 480 px wide) rather
  than the separate multi-column desktop canvases of the original design.
- **Cover photo caption**: the design had a `[caption]` placeholder under the cover polaroid; no
  real caption was provided, so it is left empty in the private story (edit `c01.008`).
- **Music** uses YouTube's official embedded player (hidden). Browsers may block autoplay — the
  disc button then pulses ("tap to play"). The video owner can disable embedding, in which case
  the player hides itself. No audio is downloaded or extracted.
- **Online status** reflects open chat connections: a person is "online" while chapter 08 is open.
- **Login throttling** (5 failures → 15 min lock) is in memory: it resets on restart and is per
  instance. Fine for one EC2 instance.
- Logging out in one tab does not force-close a WebSocket already open in another tab of the
  same browser until it reconnects.
- The S3 storage class compiles and is wired by configuration but has **not** been tested
  against a real bucket (no AWS access was used).
- No push notifications (by design).

## 13. Future AWS deployment

Summary (full guide with nginx and systemd files: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)):

1. **Domain**: put both apps under one registrable domain, e.g. `story.example.com` (Vercel) and
   `api.story.example.com` (EC2), so the `SameSite=Lax` session cookie works in every browser.
2. **RDS**: create MySQL 8 (private subnet), database `our_little_story`, utf8mb4.
3. **S3**: private bucket, block public access; EC2 instance role with
   `s3:PutObject/GetObject/DeleteObject` on that bucket; set `STORAGE_TYPE=s3`.
4. **EC2**: Java 21, `java -jar` under systemd with `SPRING_PROFILES_ACTIVE=prod` and the env vars
   from `.env.example` (DB from RDS, `CORS_ALLOWED_ORIGINS=https://story.example.com`,
   `OLS_STORY_DIR=/opt/ols/story-private`), nginx in front with HTTPS (Let's Encrypt) and
   WebSocket upgrade for `/ws`.
5. **Vercel**: import `frontend/`, set `VITE_API_BASE_URL=https://api.story.example.com`.
6. Copy the private story folder to the server (never to Git).
