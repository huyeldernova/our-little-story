package com.ourlittlestory.chat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.ourlittlestory.IntegrationTestBase;
import com.ourlittlestory.TestImages;
import com.ourlittlestory.user.User;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.ResultActions;

class ChatIntegrationTest extends IntegrationTestBase {

    private ResultActions send(User u, Long convId, String type, String content, String imageId, String clientId)
            throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("clientMessageId", clientId);
        body.put("type", type);
        body.put("content", content);
        body.put("imageId", imageId);
        return mvc.perform(post("/api/conversations/" + convId + "/messages").with(as(u)).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content(toJson(body)));
    }

    private long sendText(User u, String text) throws Exception {
        return body(send(u, conversationId, "TEXT", text, null, UUID.randomUUID().toString())
                .andExpect(status().isCreated()).andReturn()).get("id").asLong();
    }

    @Test
    void conversationListShowsBothMembersAndUnreadCount() throws Exception {
        sendText(alice, "một");
        sendText(alice, "hai");
        mvc.perform(get("/api/conversations").with(as(bob)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].members.length()").value(2))
                .andExpect(jsonPath("$[0].members[0].online").value(false))
                .andExpect(jsonPath("$[0].unreadCount").value(2))
                .andExpect(jsonPath("$[0].lastMessage.content").value("hai"));
    }

    @Test
    void sendingTheSameClientIdTwiceStoresOneMessage() throws Exception {
        String clientId = UUID.randomUUID().toString();
        JsonNode first = body(send(alice, conversationId, "TEXT", "Xin chào 👋", null, clientId)
                .andExpect(status().isCreated()).andReturn());
        JsonNode second = body(send(alice, conversationId, "TEXT", "Xin chào 👋", null, clientId)
                .andExpect(status().isCreated()).andReturn());
        assertThat(second.get("id").asLong()).isEqualTo(first.get("id").asLong());
        assertThat(first.get("content").asText()).isEqualTo("Xin chào 👋");
        Integer count = jdbc.queryForObject("select count(*) from messages", Integer.class);
        assertThat(count).isEqualTo(1);
    }

    @Test
    void historyIsPaginatedWithBeforeCursor() throws Exception {
        for (int i = 1; i <= 5; i++) {
            sendText(i % 2 == 0 ? bob : alice, "m" + i);
        }
        JsonNode page1 = body(mvc.perform(get("/api/conversations/" + conversationId + "/messages?limit=2")
                .with(as(alice))).andExpect(status().isOk()).andReturn());
        assertThat(page1.get("hasMore").asBoolean()).isTrue();
        assertThat(page1.get("messages").get(0).get("content").asText()).isEqualTo("m4");
        assertThat(page1.get("messages").get(1).get("content").asText()).isEqualTo("m5");

        long oldest = page1.get("messages").get(0).get("id").asLong();
        JsonNode page2 = body(mvc.perform(get("/api/conversations/" + conversationId
                + "/messages?limit=2&before=" + oldest).with(as(alice))).andReturn());
        assertThat(page2.get("messages").get(0).get("content").asText()).isEqualTo("m2");
        long older = page2.get("messages").get(0).get("id").asLong();
        JsonNode page3 = body(mvc.perform(get("/api/conversations/" + conversationId
                + "/messages?limit=2&before=" + older).with(as(alice))).andReturn());
        assertThat(page3.get("messages").size()).isEqualTo(1);
        assertThat(page3.get("hasMore").asBoolean()).isFalse();
    }

    @Test
    void validationRejectsEmptyAndOversizedMessages() throws Exception {
        send(alice, conversationId, "TEXT", "   ", null, UUID.randomUUID().toString())
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("EMPTY_MESSAGE"));
        send(alice, conversationId, "TEXT", "x".repeat(4001), null, UUID.randomUUID().toString())
                .andExpect(status().isBadRequest());
        send(alice, conversationId, "TEXT", "hi", null, "not-a-uuid")
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
        send(alice, conversationId, "IMAGE", null, null, UUID.randomUUID().toString())
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("MISSING_IMAGE"));
    }

    @Test
    void noteMessagesAreStoredWithTheirType() throws Exception {
        send(bob, conversationId, "NOTE", "Một ghi chú nhỏ", null, UUID.randomUUID().toString())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("NOTE"))
                .andExpect(jsonPath("$.senderName").value("Bob"));
    }

    @Test
    void imageMessagesMustUseAnImageUploadedBySender() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "p.png", "image/png", TestImages.png(8, 6));
        String imageId = body(mvc.perform(multipart("/api/uploads/images").file(file).with(as(alice)).with(csrf()))
                .andExpect(status().isCreated()).andReturn()).get("id").asText();

        send(bob, conversationId, "IMAGE", null, imageId, UUID.randomUUID().toString())
                .andExpect(status().isForbidden());
        send(alice, conversationId, "IMAGE", "ảnh nè", imageId, UUID.randomUUID().toString())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.image.id").value(imageId))
                .andExpect(jsonPath("$.image.url").value("/api/images/" + imageId))
                .andExpect(jsonPath("$.content").value("ảnh nè"));
    }

    @Test
    void readMarkerOnlyMovesForward() throws Exception {
        long m1 = sendText(alice, "a");
        long m2 = sendText(alice, "b");
        String url = "/api/conversations/" + conversationId + "/read";
        mvc.perform(put(url).with(as(bob)).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"lastReadMessageId\":" + m2 + "}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.lastReadMessageId").value(m2));
        mvc.perform(put(url).with(as(bob)).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"lastReadMessageId\":" + m1 + "}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.lastReadMessageId").value(m2));
        mvc.perform(get("/api/conversations").with(as(bob)))
                .andExpect(jsonPath("$[0].unreadCount").value(0));
        mvc.perform(put(url).with(as(bob)).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"lastReadMessageId\":999999}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void outsidersCannotReadOrWriteTheConversation() throws Exception {
        User mallory = outsider();
        sendText(alice, "secret");
        mvc.perform(get("/api/conversations/" + conversationId + "/messages").with(as(mallory)))
                .andExpect(status().isNotFound());
        send(mallory, conversationId, "TEXT", "hi", null, UUID.randomUUID().toString())
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/conversations").with(as(mallory)))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Other"));
    }

    @Test
    void anonymousRequestsAreRejected() throws Exception {
        mvc.perform(get("/api/conversations")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/conversations/" + conversationId + "/messages").with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isUnauthorized());
    }
}
