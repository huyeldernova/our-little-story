package com.ourlittlestory.auth;

import com.ourlittlestory.config.AppProperties;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Small in-memory brute-force guard: after N failed logins for the same
 * username (or the same client IP) further attempts are refused for a while.
 * Good enough for a two-user, single-instance app.
 */
@Service
public class LoginAttemptService {

    private record Attempts(int failures, Instant lockedUntil) {
    }

    private final ConcurrentHashMap<String, Attempts> attempts = new ConcurrentHashMap<>();
    private final int maxFailures;
    private final Duration lockDuration;
    private final Clock clock;

    @Autowired
    public LoginAttemptService(AppProperties props) {
        this(props.login().maxFailures(), Duration.ofMinutes(props.login().lockMinutes()), Clock.systemUTC());
    }

    LoginAttemptService(int maxFailures, Duration lockDuration, Clock clock) {
        this.maxFailures = maxFailures;
        this.lockDuration = lockDuration;
        this.clock = clock;
    }

    public boolean isBlocked(String username, String ip) {
        return blocked(userKey(username)) || blocked(ipKey(ip));
    }

    public void recordFailure(String username, String ip) {
        fail(userKey(username));
        fail(ipKey(ip));
    }

    public void recordSuccess(String username, String ip) {
        attempts.remove(userKey(username));
        attempts.remove(ipKey(ip));
    }

    private boolean blocked(String key) {
        Attempts a = attempts.get(key);
        if (a == null || a.lockedUntil() == null) {
            return false;
        }
        if (clock.instant().isAfter(a.lockedUntil())) {
            attempts.remove(key);
            return false;
        }
        return true;
    }

    private void fail(String key) {
        attempts.compute(key, (k, old) -> {
            int failures = (old == null ? 0 : old.failures()) + 1;
            Instant lockedUntil = failures >= maxFailures ? clock.instant().plus(lockDuration) : null;
            return new Attempts(failures, lockedUntil);
        });
    }

    private static String userKey(String username) {
        return "u:" + (username == null ? "" : username.trim().toLowerCase(Locale.ROOT));
    }

    private static String ipKey(String ip) {
        return "ip:" + (ip == null ? "" : ip);
    }
}
