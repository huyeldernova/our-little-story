package com.ourlittlestory.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.ourlittlestory.IntegrationTestBase;
import jakarta.servlet.http.Cookie;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MvcResult;

class AuthIntegrationTest extends IntegrationTestBase {

    private record Csrf(MockHttpSession session, String header, String token) {
    }

    private Csrf csrf(MockHttpSession session) throws Exception {
        MvcResult r = mvc.perform(get("/api/auth/csrf").session(session)).andExpect(status().isOk()).andReturn();
        JsonNode b = body(r);
        return new Csrf(session, b.get("headerName").asText(), b.get("token").asText());
    }

    private String loginJson(String user, String pw) throws Exception {
        return toJson(Map.of("username", user, "password", pw));
    }

    @Test
    void meRequiresAuthentication() throws Exception {
        mvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
    }

    @Test
    void loginWithoutCsrfTokenIsRejected() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("alice", "test-only-password-a")))
                .andExpect(status().isForbidden());
    }

    @Test
    void loginWithWrongPasswordFails() throws Exception {
        Csrf c = csrf(new MockHttpSession());
        mvc.perform(post("/api/auth/login").session(c.session()).header(c.header(), c.token())
                        .contentType(MediaType.APPLICATION_JSON).content(loginJson("alice", "wrong-password")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    }

    @Test
    void fullSessionFlow_loginMeLogout() throws Exception {
        MockHttpSession session = new MockHttpSession();
        Csrf c = csrf(session);
        String oldSessionId = session.getId();
        MvcResult login = mvc.perform(post("/api/auth/login").session(session).header(c.header(), c.token())
                        .contentType(MediaType.APPLICATION_JSON).content(loginJson("alice", "test-only-password-a")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("alice"))
                .andExpect(jsonPath("$.displayName").value("Alice"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andReturn();
        MockHttpSession authed = (MockHttpSession) login.getRequest().getSession();
        assertThat(authed.getId()).as("session id rotated on login").isNotEqualTo(oldSessionId);

        mvc.perform(get("/api/auth/me").session(authed))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("alice"));

        // The CSRF token is rotated on login: the old one no longer works.
        mvc.perform(post("/api/auth/logout").session(authed).header(c.header(), c.token()))
                .andExpect(status().isForbidden());

        Csrf fresh = csrf(authed);
        mvc.perform(post("/api/auth/logout").session(authed).header(fresh.header(), fresh.token()))
                .andExpect(status().isNoContent());
        assertThat(authed.isInvalid()).isTrue();
    }

    @Test
    void repeatedFailuresLockTheAccountTemporarily() throws Exception {
        Csrf c = csrf(new MockHttpSession());
        for (int i = 0; i < 5; i++) {
            mvc.perform(post("/api/auth/login").session(c.session()).header(c.header(), c.token())
                            .with(r -> { r.setRemoteAddr("10.9.9.9"); return r; })
                            .contentType(MediaType.APPLICATION_JSON).content(loginJson("bob", "bad-" + i)))
                    .andExpect(status().isUnauthorized());
        }
        mvc.perform(post("/api/auth/login").session(c.session()).header(c.header(), c.token())
                        .with(r -> { r.setRemoteAddr("10.9.9.9"); return r; })
                        .contentType(MediaType.APPLICATION_JSON).content(loginJson("bob", "test-only-password-b")))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    void passwordsAreStoredAsBcryptHashes() {
        String hash = users.findByUsername("alice").orElseThrow().getPasswordHash();
        assertThat(hash).startsWith("$2a$12$").doesNotContain("test-only-password-a");
    }

    @Test
    void thereIsNoRegistrationEndpoint() throws Exception {
        mvc.perform(post("/api/auth/register").with(as(alice))
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isNotFound());
        assertThat(users.findAll().stream().filter(u -> !u.getUsername().equals("mallory")).count()).isEqualTo(2);
    }

    @Test
    void anonymousHealthCheckDoesNotCreateASession() throws Exception {
        Cookie[] none = mvc.perform(get("/api/health")).andReturn().getResponse().getCookies();
        assertThat(none).isEmpty();
    }
}
