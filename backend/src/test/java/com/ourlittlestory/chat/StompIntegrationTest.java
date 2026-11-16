package com.ourlittlestory.chat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.ourlittlestory.IntegrationTestBase;
import java.lang.reflect.Type;
import java.net.CookieManager;
import java.net.HttpCookie;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class StompIntegrationTest extends IntegrationTestBase {

    private static final String ORIGIN = "http://localhost:5173";

    @LocalServerPort
    int port;

    private final List<StompSession> sessions = new ArrayList<>();

    @AfterEach
    void closeSessions() {
        sessions.forEach(s -> {
            if (s.isConnected()) {
                s.disconnect();
            }
        });
    }

    /** Logs in over real HTTP (CSRF + session cookie) and returns the session cookie value. */
    private String login(String username, String password) throws Exception {
        CookieManager cookies = new CookieManager();
        HttpClient http = HttpClient.newBuilder().cookieHandler(cookies).build();
        String base = "http://localhost:" + port;
        String csrfJson = http.send(HttpRequest.newBuilder(URI.create(base + "/api/auth/csrf")).build(),
                HttpResponse.BodyHandlers.ofString()).body();
        String token = json.readTree(csrfJson).get("token").asText();
        HttpResponse<String> res = http.send(HttpRequest.newBuilder(URI.create(base + "/api/auth/login"))
                        .header("Content-Type", "application/json")
                        .header("X-CSRF-TOKEN", token)
                        .POST(HttpRequest.BodyPublishers.ofString(
                                toJson(Map.of("username", username, "password", password))))
                        .build(),
                HttpResponse.BodyHandlers.ofString());
        assertThat(res.statusCode()).isEqualTo(200);
        return cookies.getCookieStore().getCookies().stream()
                .filter(c -> c.getName().equals("OLS_SESSION")).map(HttpCookie::getValue)
                .findFirst().orElseThrow();
    }

    private StompSession connect(String sessionCookie, String origin) throws Exception {
        WebSocketStompClient client = new WebSocketStompClient(new StandardWebSocketClient());
        client.setMessageConverter(new MappingJackson2MessageConverter());
        WebSocketHttpHeaders headers = new WebSocketHttpHeaders();
        if (sessionCookie != null) {
            headers.add("Cookie", "OLS_SESSION=" + sessionCookie);
        }
        headers.setOrigin(origin);
        StompSession s = client.connectAsync("ws://localhost:" + port + "/ws", headers,
                new StompSessionHandlerAdapter() { }).get(5, TimeUnit.SECONDS);
        sessions.add(s);
        return s;
    }

    @SuppressWarnings("unchecked")
    private BlockingQueue<Map<String, Object>> subscribe(StompSession s, String destination) {
        BlockingQueue<Map<String, Object>> q = new LinkedBlockingQueue<>();
        s.subscribe(destination, new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return Map.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                q.add((Map<String, Object>) payload);
            }
        });
        return q;
    }

    /** Waits for the next event of a type, skipping others (e.g. presence noise). */
    private Map<String, Object> next(BlockingQueue<Map<String, Object>> q, String type) throws Exception {
        long deadline = System.currentTimeMillis() + 5000;
        while (System.currentTimeMillis() < deadline) {
            Map<String, Object> e = q.poll(200, TimeUnit.MILLISECONDS);
            if (e != null && type.equals(e.get("type"))) {
                return e;
            }
        }
        throw new AssertionError("No " + type + " event received");
    }

    @Test
    @SuppressWarnings("unchecked")
    void twoUsersChatInRealTimeWithPresenceTypingAndPersistence() throws Exception {
        String topic = "/topic/conversations/" + conversationId;
        StompSession a = connect(login("alice", "test-only-password-a"), ORIGIN);
        BlockingQueue<Map<String, Object>> aEvents = subscribe(a, topic);
        Thread.sleep(300);

        StompSession b = connect(login("bob", "test-only-password-b"), ORIGIN);
        BlockingQueue<Map<String, Object>> bEvents = subscribe(b, topic);
        Map<String, Object> presence = next(aEvents, "PRESENCE");
        assertThat(((Map<String, Object>) presence.get("payload")).get("userId")).isEqualTo(bob.getId().intValue());
        assertThat(((Map<String, Object>) presence.get("payload")).get("online")).isEqualTo(true);
        Thread.sleep(300);

        String clientId = UUID.randomUUID().toString();
        a.send("/app/chat.send", Map.of("conversationId", conversationId, "clientMessageId", clientId,
                "type", "TEXT", "content", "Chào Bob, realtime nè"));
        Map<String, Object> got = (Map<String, Object>) next(bEvents, "MESSAGE").get("payload");
        assertThat(got.get("content")).isEqualTo("Chào Bob, realtime nè");
        assertThat(got.get("clientMessageId")).isEqualTo(clientId);
        Map<String, Object> echo = (Map<String, Object>) next(aEvents, "MESSAGE").get("payload");
        assertThat(echo.get("id")).isEqualTo(got.get("id"));

        Integer stored = jdbc.queryForObject("select count(*) from messages where client_message_id = ?",
                Integer.class, clientId);
        assertThat(stored).as("message persisted before broadcast").isEqualTo(1);

        b.send("/app/chat.typing", Map.of("conversationId", conversationId, "typing", true));
        Map<String, Object> typing = (Map<String, Object>) next(aEvents, "TYPING").get("payload");
        assertThat(typing.get("typing")).isEqualTo(true);
        assertThat(typing.get("displayName")).isEqualTo("Bob");

        b.disconnect();
        Map<String, Object> offline = (Map<String, Object>) next(aEvents, "PRESENCE").get("payload");
        assertThat(offline.get("online")).isEqualTo(false);
    }

    @Test
    @SuppressWarnings("unchecked")
    void clientsCannotSendPlanCardsOverStomp() throws Exception {
        StompSession a = connect(login("alice", "test-only-password-a"), ORIGIN);
        BlockingQueue<Map<String, Object>> errors = subscribe(a, "/user/queue/errors");
        Thread.sleep(300);
        String clientId = UUID.randomUUID().toString();
        a.send("/app/chat.send", Map.of("conversationId", conversationId, "clientMessageId", clientId,
                "type", "PLAN", "content", "fake"));
        Map<String, Object> err = errors.poll(5, TimeUnit.SECONDS);
        assertThat(err).isNotNull();
        assertThat(err.get("code")).isEqualTo("PLAN_NOT_ALLOWED");
        assertThat(err.get("clientMessageId")).isEqualTo(clientId);
        Integer plans = jdbc.queryForObject("select count(*) from messages where type = 'PLAN'", Integer.class);
        assertThat(plans).isZero();
    }

    @Test
    @SuppressWarnings("unchecked")
    void aSuggestionArrivesAsAPlanCardInRealTime() throws Exception {
        StompSession b = connect(login("bob", "test-only-password-b"), ORIGIN);
        BlockingQueue<Map<String, Object>> bEvents = subscribe(b, "/topic/conversations/" + conversationId);
        Thread.sleep(300);
        jdbc.update("""
                insert into date_invitations (inviter_id, invitee_id, status, created_at, updated_at, version)
                values (?, ?, 'ACCEPTED', current_timestamp, current_timestamp, 0)""", alice.getId(), bob.getId());
        Long invId = jdbc.queryForObject("select max(id) from date_invitations", Long.class);
        String date = java.time.LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(3).toString();
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .post("/api/invitations/" + invId + "/proposals").with(as(alice))
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(toJson(Map.of("proposedDate", date, "timeSlot", "EVENING", "activity", "Ăn tối"))))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isCreated());
        Map<String, Object> got = (Map<String, Object>) next(bEvents, "MESSAGE").get("payload");
        assertThat(got.get("type")).isEqualTo("PLAN");
        Map<String, Object> plan = (Map<String, Object>) got.get("plan");
        assertThat(plan.get("activity")).isEqualTo("Ăn tối");
        assertThat(plan.get("proposerName")).isEqualTo("Alice");
        assertThat(plan.get("confirmed")).isEqualTo(false);
    }

    @Test
    @SuppressWarnings("unchecked")
    void invalidMessagesAreReportedOnlyToTheSender() throws Exception {
        StompSession a = connect(login("alice", "test-only-password-a"), ORIGIN);
        BlockingQueue<Map<String, Object>> errors = subscribe(a, "/user/queue/errors");
        Thread.sleep(300);
        String clientId = UUID.randomUUID().toString();
        a.send("/app/chat.send", Map.of("conversationId", conversationId, "clientMessageId", clientId,
                "type", "TEXT", "content", "   "));
        Map<String, Object> err = errors.poll(5, TimeUnit.SECONDS);
        assertThat(err).isNotNull();
        assertThat(err.get("code")).isEqualTo("EMPTY_MESSAGE");
        assertThat(err.get("clientMessageId")).isEqualTo(clientId);
    }

    @Test
    void outsiderCannotSubscribeToSomeoneElsesConversation() throws Exception {
        outsider();
        StompSession m = connect(login("mallory", "outsider-password"), ORIGIN);
        BlockingQueue<Map<String, Object>> q = subscribe(m, "/topic/conversations/" + conversationId);
        long deadline = System.currentTimeMillis() + 3000;
        while (m.isConnected() && System.currentTimeMillis() < deadline) {
            Thread.sleep(100);
        }
        assertThat(m.isConnected()).as("server closes the session on a forbidden SUBSCRIBE").isFalse();
        assertThat(q).isEmpty();
    }

    @Test
    void handshakeNeedsASessionAndAnAllowedOrigin() throws Exception {
        assertThatThrownBy(() -> connect(null, ORIGIN)).as("no session cookie").isInstanceOf(Exception.class);
        String cookie = login("alice", "test-only-password-a");
        assertThatThrownBy(() -> connect(cookie, "https://evil.example.com")).as("foreign origin")
                .isInstanceOf(Exception.class);
        assertThat(connect(cookie, ORIGIN).isConnected()).isTrue();
    }
}
