# Deploy on Railway (one service)

One Railway service runs the Spring Boot app, which serves **everything on one domain**
(`https://<name>.up.railway.app`):

| Path | Served by |
|------|-----------|
| `/`, `/login`, `/story/…`, `/admin/story` | the built React app (`index.html`, `Cache-Control: no-cache`) |
| `/assets/*` | hashed JS/CSS from the build (`Cache-Control: max-age=31536000, immutable`) |
| `/api/*` | REST API (session cookie + CSRF, as before) |
| `/ws` | STOMP WebSocket |

No Vercel, no cross-site CORS. Local development is unchanged (Vite on :5173, backend on :8080).

The image is built from the `Dockerfile` at the repository root (`railway.json` tells Railway to
use it and to health-check `/api/health`):

1. `node:22` builds `frontend/` (`VITE_API_BASE_URL` empty → same origin).
2. `maven:3.9 + JDK 21` copies `frontend/dist` into `classpath:/static` and packages the jar.
3. `eclipse-temurin:21-jre` runs the jar with `SPRING_PROFILES_ACTIVE=prod` as the non-root user
   `app` (the entrypoint only prepares the root-owned volume at `/data`, then drops privileges).
   The public placeholder story (`story-example/`) is copied to `/app/story-example`.

The build output (`frontend/dist`, `backend/src/main/resources/static`) is never committed.

## 1. Create the project

1. Railway → **New project** → **Deploy from GitHub repo** → pick this repository (branch `main`).
   Railway detects `railway.json` and builds the `Dockerfile`.
2. In the same project: **+ New** → **Database** → **MySQL**. Its service is called `MySQL`
   (if you rename it, change `MySQL.` in the variables below).
3. App service → **Settings → Networking → Generate domain** (e.g. `our-little-story.up.railway.app`).
4. App service → **Settings → Volumes → Add volume**, mount path **`/data`** (uploads + story content).

## 2. Variables (app service → Variables)

| Variable | Value |
|----------|-------|
| `DB_URL` | `jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useUnicode=true&characterEncoding=utf8&connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true` |
| `DB_USERNAME` | `${{MySQL.MYSQLUSER}}` |
| `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
| `OLS_USER1_USERNAME` / `OLS_USER1_DISPLAY_NAME` / `OLS_USER1_PASSWORD` | the story author (the only one allowed to upload content) |
| `OLS_USER2_USERNAME` / `OLS_USER2_DISPLAY_NAME` / `OLS_USER2_PASSWORD` | the second person |
| `UPLOAD_DIR` | `/data/uploads` (default in the image) |
| `OLS_STORY_DIR` | `/data/story` (default in the image) |

Optional:

| Variable | Default | Notes |
|----------|---------|-------|
| `CORS_ALLOWED_ORIGINS` | `https://${RAILWAY_PUBLIC_DOMAIN}` | Also the WebSocket Origin allow-list. Set it if you add a custom domain (comma-separated list). |
| `APP_TIME_ZONE` | `Asia/Ho_Chi_Minh` | |
| `OLS_RESET_PASSWORDS` | `false` | `true` for one start to apply new passwords from the variables. |
| `JAVA_OPTS` | `-XX:MaxRAMPercentage=75` | |
| `API_DOCS_ENABLED` | `false` | Swagger UI in production. |

`PORT` and `RAILWAY_PUBLIC_DOMAIN` are provided by Railway. HTTPS is terminated by Railway's proxy;
`server.forward-headers-strategy=native` makes the app trust `X-Forwarded-Proto`, and the session
cookie is `Secure` + `HttpOnly` + `SameSite=Lax`.

Passwords (≥ 10 characters) are only read when the users table is empty (first start) or with
`OLS_RESET_PASSWORDS=true`. After the first successful start you may delete the two password
variables.

## 3. Deploy

Every push to `main` builds and deploys. Flyway creates/updates the schema on start-up.
The deploy is healthy when `GET /api/health` returns `{"status":"UP"}`.

Open `https://<name>.up.railway.app` → the login page. Until the private content is uploaded the
site shows the **placeholder story** (the log says `No story.json in /data/story; serving the
placeholder story …`).

## 4. Upload the private story content

The real texts and photos (`story-private/`: `story.json` + `assets/`) are never in Git.

1. Zip the folder: `story-private.zip` containing either `story-private/story.json` +
   `story-private/assets/*` or directly `story.json` + `assets/*`.
   Only `story.json` and `assets/*.jpg|jpeg|png|webp|gif` (lower-case extensions) are used;
   anything else (README, `__MACOSX/`, `.DS_Store`) is ignored. Max 60 MB.
2. Sign in as **user1** (the author), open the chapter list (☰ on mobile) or the footer on desktop →
   **NỘI DUNG**, or go to `/admin/story` directly.
3. Choose the zip → **TẢI LÊN**. The page shows how many files were received.
4. Reload the story: the new content is served immediately (no redeploy).

Safety: only the author's account may upload (others get 403), CSRF is required, paths with `..`
or absolute paths reject the whole upload, `story.json` must be JSON with `"texts"`, and the new
content is unpacked to a temporary folder on the volume and then moved into place, so a failed
upload leaves the previous content untouched.

## 5. Check after deploy

- `/api/health` → `{"status":"UP"}`
- Refresh on `/story/5` → the page loads (no 404).
- Sign in on two devices, open chapter 08: online status, typing and new messages appear live.
- Upload a chat photo: it is stored under `/data/uploads` and survives redeploys (volume).

## Troubleshooting

- **WebSocket closes immediately / 403 on `/ws`**: the browser's Origin is not in
  `CORS_ALLOWED_ORIGINS` (e.g. a custom domain) — add it.
- **Logged out after every request**: the app is reached over plain HTTP; use the `https://` domain.
- **Permission denied under `/data`**: the volume must be mounted at `/data` (the entrypoint prepares
  `/data/uploads` and `/data` for the `app` user).
