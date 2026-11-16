package com.ourlittlestory.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Application settings. Every secret comes from environment variables
 * (see application.yml and .env.example); nothing secret has a default.
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        Cors cors,
        Bootstrap bootstrap,
        Storage storage,
        Story story,
        Docs docs,
        Login login) {

    public AppProperties {
        if (cors == null) cors = new Cors(List.of());
        if (bootstrap == null) bootstrap = new Bootstrap(null, null, false, "Our Little Chat", true);
        if (storage == null) storage = new Storage("local", null, null);
        if (story == null) story = new Story(null);
        if (docs == null) docs = new Docs(false);
        if (login == null) login = new Login(5, 15);
    }

    /** Origins allowed for CORS and for the WebSocket handshake. */
    public record Cors(List<String> allowedOrigins) {
        public Cors {
            if (allowedOrigins == null) allowedOrigins = List.of();
        }
    }

    /**
     * The two accounts created on first start-up. Passwords come only from env vars.
     * user1 is the author of the story and sends the date invitation to user2.
     */
    public record Bootstrap(BootstrapUser user1, BootstrapUser user2, boolean resetPasswords, String conversationTitle,
                            Boolean createInvitation) {
        public Bootstrap {
            if (conversationTitle == null || conversationTitle.isBlank()) conversationTitle = "Our Little Chat";
            if (createInvitation == null) createInvitation = true;
        }
    }

    public record BootstrapUser(String username, String displayName, String password) {
    }

    public record Storage(String type, Local local, S3 s3) {
        public Storage {
            if (type == null || type.isBlank()) type = "local";
            if (local == null) local = new Local("./data/uploads");
            if (s3 == null) s3 = new S3(null, null, null);
        }
    }

    public record Local(String directory) {
    }

    public record S3(String bucket, String region, String prefix) {
    }

    /** Directory that holds the private story content (story.json + assets/). */
    public record Story(String directory) {
    }

    public record Docs(boolean publicAccess) {
    }

    public record Login(int maxFailures, int lockMinutes) {
        public Login {
            if (maxFailures <= 0) maxFailures = 5;
            if (lockMinutes <= 0) lockMinutes = 15;
        }
    }
}
