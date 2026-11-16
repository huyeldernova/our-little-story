#!/bin/sh
# Railway volumes are mounted owned by root. Prepare /data, then drop to the non-root "app" user.
set -e
if [ "$(id -u)" = "0" ]; then
  mkdir -p "${UPLOAD_DIR:-/data/uploads}" "$(dirname "${OLS_STORY_DIR:-/data/story}")"
  chown app:app "${UPLOAD_DIR:-/data/uploads}" "$(dirname "${OLS_STORY_DIR:-/data/story}")"
  [ -d "${OLS_STORY_DIR:-/data/story}" ] && chown -R app:app "${OLS_STORY_DIR:-/data/story}"
  # shellcheck disable=SC2086
  exec setpriv --reuid=app --regid=app --init-groups java $JAVA_OPTS -jar /app/app.jar
fi
# shellcheck disable=SC2086
exec java $JAVA_OPTS -jar /app/app.jar
