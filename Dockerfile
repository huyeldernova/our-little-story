# Single-service image for Railway (or any Docker host):
# Spring Boot serves the REST API, the STOMP WebSocket and the built React app on one origin.

# ---- 1. Frontend ----------------------------------------------------------
FROM node:22-bookworm-slim AS frontend
WORKDIR /src/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund
COPY frontend/ ./
# Empty VITE_API_BASE_URL: the app calls /api and /ws on its own origin.
ENV VITE_API_BASE_URL=""
RUN npm run build

# ---- 2. Backend -----------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21 AS backend
WORKDIR /src/backend
COPY backend/pom.xml ./
RUN mvn -B -q dependency:go-offline
COPY backend/src ./src
COPY --from=frontend /src/frontend/dist ./src/main/resources/static
RUN mvn -B -DskipTests package && cp target/*.jar /app.jar

# ---- 3. Runtime -----------------------------------------------------------
FROM eclipse-temurin:21-jre
RUN groupadd --system app && useradd --system --gid app --home-dir /app --shell /usr/sbin/nologin app
WORKDIR /app
COPY --from=backend /app.jar /app/app.jar
# Public placeholder story, served until the private content is uploaded (/admin/story).
COPY story-example /app/story-example
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod 755 /app/docker-entrypoint.sh && chown -R app:app /app
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:MaxRAMPercentage=75" \
    UPLOAD_DIR=/data/uploads \
    OLS_STORY_DIR=/data/story \
    OLS_STORY_FALLBACK_DIR=/app/story-example
EXPOSE 8080
# The entrypoint prepares the (root-owned) volume at /data, then runs the JVM as the "app" user.
ENTRYPOINT ["/app/docker-entrypoint.sh"]
