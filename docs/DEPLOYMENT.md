# Deployment (AWS EC2 + RDS + S3, Vercel)

Not yet performed — this is the intended path. Nothing here needs code changes.

## 0. Domains (important)

Use one registrable domain for both parts, for example:

- `https://story.example.com` → Vercel (frontend)
- `https://api.story.example.com` → EC2 (backend)

The session cookie is `SameSite=Lax`; browsers (Safari especially) drop cookies between
*different* sites such as `*.vercel.app` ↔ `ec2-…amazonaws.com`. Same-site subdomains work.

## 1. RDS (MySQL 8)

- Engine MySQL 8.0/8.4, private subnet, security group allowing 3306 **only** from the EC2 SG.
- Parameter group: `character_set_server=utf8mb4`, `collation_server=utf8mb4_0900_ai_ci`.
- Create database `our_little_story` and an app user with privileges on it only.
- Flyway migrates the schema on the first start of the backend.

## 2. S3 (images)

- Private bucket, *Block all public access* on, default encryption on.
- IAM role attached to the EC2 instance with:
  ```json
  {"Effect":"Allow","Action":["s3:PutObject","s3:GetObject","s3:DeleteObject"],
   "Resource":"arn:aws:s3:::YOUR_BUCKET/ols/*"}
  ```
- No access keys anywhere: the AWS SDK picks up the instance role automatically.
- Env: `STORAGE_TYPE=s3`, `S3_BUCKET=YOUR_BUCKET`, `AWS_REGION=…`, `S3_PREFIX=ols/`.
  Images are still served through `/api/images/{id}`, so access control is unchanged.
- ⚠ The S3 implementation compiles and is configuration-wired, but has not been tested against
  a real bucket yet. Upload one image after deploying and check it.

## 3. EC2 (backend)

```bash
sudo apt install openjdk-21-jre-headless nginx certbot python3-certbot-nginx
sudo useradd --system --home /opt/ols ols
sudo mkdir -p /opt/ols/story-private && sudo chown -R ols: /opt/ols
# copy backend/target/our-little-story-backend-1.0.0.jar → /opt/ols/app.jar
# copy your private story folder        → /opt/ols/story-private (scp, never git)
```

`/etc/ols.env` (chmod 600, owner root):

```
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:mysql://YOUR-RDS-ENDPOINT:3306/our_little_story?useUnicode=true&characterEncoding=utf8&connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true&sslMode=REQUIRED
DB_USERNAME=…
DB_PASSWORD=…
OLS_USER1_USERNAME=… / OLS_USER1_DISPLAY_NAME=… / OLS_USER1_PASSWORD=…
OLS_USER2_USERNAME=… / OLS_USER2_DISPLAY_NAME=… / OLS_USER2_PASSWORD=…
OLS_STORY_DIR=/opt/ols/story-private
CORS_ALLOWED_ORIGINS=https://story.example.com
STORAGE_TYPE=s3
S3_BUCKET=… 
AWS_REGION=…
```

(After the first successful start you may remove the two passwords from the file; they are only
read when the users table is empty or `OLS_RESET_PASSWORDS=true`.)

`/etc/systemd/system/ols.service`:

```ini
[Unit]
Description=Our Little Story backend
After=network-online.target

[Service]
User=ols
EnvironmentFile=/etc/ols.env
ExecStart=/usr/bin/java -Xms256m -Xmx512m -jar /opt/ols/app.jar
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

nginx (`/etc/nginx/sites-available/ols`), then `sudo certbot --nginx -d api.story.example.com`:

```nginx
server {
    server_name api.story.example.com;
    client_max_body_size 12m;

    location /ws {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600s;
    }
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Security group: 80/443 from anywhere, 22 from your IP only; 8080 closed.

## 4. Vercel (frontend)

- Import the repository, **Root Directory** `frontend`, framework Vite.
- Environment variable `VITE_API_BASE_URL=https://api.story.example.com`.
- `frontend/vercel.json` rewrites every route to `index.html` and adds basic security headers.
- Add the custom domain `story.example.com`.

## 5. Checklist after deploying

- `https://api.story.example.com/api/health` → `{"status":"UP"}`
- Log in on the site, open chapter 08 from two devices, send a message and an image.
- Swagger is off in prod (`API_DOCS_ENABLED=false`).
- Back up RDS (automated snapshots) and the S3 bucket (versioning).
