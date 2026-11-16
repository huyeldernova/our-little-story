package com.ourlittlestory.invitation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.ourlittlestory.IntegrationTestBase;
import com.ourlittlestory.chat.ChatBroadcaster;
import com.ourlittlestory.chat.ChatDtos.ChatEvent;
import com.ourlittlestory.chat.ChatDtos.MessageDto;
import com.ourlittlestory.chat.MessageType;
import com.ourlittlestory.invitation.InvitationDtos.CreateProposalRequest;
import com.ourlittlestory.user.User;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/** PLAN cards: posted into the shared chat when a plan is suggested or confirmed. */
class PlanMessageIntegrationTest extends IntegrationTestBase {

    @MockitoSpyBean
    ChatBroadcaster broadcaster;
    @Autowired
    InvitationService service;
    @Autowired
    PlatformTransactionManager txManager;

    private final LocalDate nextWeek = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(7);
    private long invitationId;

    @BeforeEach
    void invitation() throws Exception {
        invitationId = body(mvc.perform(post("/api/invitations").with(as(alice)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isCreated()).andReturn()).get("id").asLong();
        clearInvocations(broadcaster);
    }

    private ResultActions propose(User u, String slot, String time) throws Exception {
        Map<String, Object> b = new HashMap<>();
        b.put("proposedDate", nextWeek.toString());
        b.put("timeSlot", slot);
        b.put("specificTime", time);
        b.put("activity", "Đi cà phê");
        b.put("location", "Một quán nhỏ");
        b.put("note", "Không cần cầu kỳ");
        return mvc.perform(post("/api/invitations/" + invitationId + "/proposals").with(as(u)).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content(toJson(b)));
    }

    private int planCount() {
        return jdbc.queryForObject("select count(*) from messages where type = 'PLAN'", Integer.class);
    }

    private JsonNode history(User u) throws Exception {
        return body(mvc.perform(get("/api/conversations/" + conversationId + "/messages").with(as(u)))
                .andExpect(status().isOk()).andReturn()).get("messages");
    }

    @Test
    void aSuggestionPostsExactlyOnePlanCardInTheSharedConversation() throws Exception {
        long proposalId = body(propose(bob, "EVENING", "19:30").andExpect(status().isCreated()).andReturn())
                .get("proposals").get(0).get("id").asLong();

        assertThat(planCount()).isEqualTo(1);
        Map<String, Object> row = jdbc.queryForMap(
                "select conversation_id, sender_id, proposal_id, content, client_message_id from messages");
        assertThat(((Number) row.get("conversation_id")).longValue()).isEqualTo(conversationId);
        assertThat(((Number) row.get("sender_id")).longValue()).as("sender = proposer").isEqualTo(bob.getId());
        assertThat(((Number) row.get("proposal_id")).longValue()).isEqualTo(proposalId);
        assertThat(row.get("content")).isNull();
        assertThat(UUID.fromString((String) row.get("client_message_id"))).as("server-made UUID").isNotNull();

        JsonNode card = history(alice).get(0);
        assertThat(card.get("type").asText()).isEqualTo("PLAN");
        JsonNode plan = card.get("plan");
        assertThat(plan.get("invitationId").asLong()).isEqualTo(invitationId);
        assertThat(plan.get("proposalId").asLong()).isEqualTo(proposalId);
        assertThat(plan.get("activity").asText()).isEqualTo("Đi cà phê");
        assertThat(plan.get("proposedDate").asText()).isEqualTo(nextWeek.toString());
        assertThat(plan.get("timeSlot").asText()).isEqualTo("EVENING");
        assertThat(plan.get("specificTime").asText()).startsWith("19:30");
        assertThat(plan.get("location").asText()).isEqualTo("Một quán nhỏ");
        assertThat(plan.get("note").asText()).isEqualTo("Không cần cầu kỳ");
        assertThat(plan.get("proposerName").asText()).isEqualTo("Bob");
        assertThat(plan.get("inviterAgreed").asBoolean()).isFalse();
        assertThat(plan.get("inviteeAgreed").asBoolean()).isTrue();
        assertThat(plan.get("confirmed").asBoolean()).isFalse();
        assertThat(plan.get("inviterId").asLong()).isEqualTo(alice.getId());
    }

    @Test
    void confirmingPostsOneMoreCardAndOlderCardsShowTheCurrentState() throws Exception {
        long proposalId = body(propose(bob, "EVENING", null).andReturn()).get("proposals").get(0).get("id").asLong();
        assertThat(planCount()).isEqualTo(1);

        // Agreeing to your own suggestion again does not confirm, so no new card.
        mvc.perform(post("/api/invitations/" + invitationId + "/proposals/" + proposalId + "/agree")
                .with(as(bob)).with(csrf())).andExpect(status().isOk());
        assertThat(planCount()).isEqualTo(1);

        mvc.perform(post("/api/invitations/" + invitationId + "/proposals/" + proposalId + "/agree")
                        .with(as(alice)).with(csrf()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.confirmedProposalId").value(proposalId));
        assertThat(planCount()).isEqualTo(2);

        JsonNode msgs = history(bob);
        assertThat(msgs.size()).isEqualTo(2);
        assertThat(msgs.get(1).get("senderId").asLong()).as("sender = the person who agreed").isEqualTo(alice.getId());
        for (JsonNode m : msgs) {
            assertThat(m.get("plan").get("proposalId").asLong()).isEqualTo(proposalId);
            assertThat(m.get("plan").get("confirmed").asBoolean()).as("live state, not a snapshot").isTrue();
            assertThat(m.get("plan").get("inviterAgreed").asBoolean()).isTrue();
        }

        // Agreeing again to the confirmed plan changes nothing.
        mvc.perform(post("/api/invitations/" + invitationId + "/proposals/" + proposalId + "/agree")
                .with(as(bob)).with(csrf())).andExpect(status().isOk());
        assertThat(planCount()).isEqualTo(2);
    }

    @Test
    void outsidersDoNotSeePlanCards() throws Exception {
        propose(alice, "MORNING", null).andExpect(status().isCreated());
        User mallory = outsider();
        mvc.perform(get("/api/conversations/" + conversationId + "/messages").with(as(mallory)))
                .andExpect(status().isNotFound());
        Long malloryConv = members.findByUserIdWithConversation(mallory.getId()).get(0).getConversation().getId();
        mvc.perform(get("/api/conversations/" + malloryConv + "/messages").with(as(mallory)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.messages.length()").value(0));
        verify(broadcaster, never()).publish(eq(malloryConv), any(), any());
    }

    @Test
    void clientsCannotSendPlanMessages() throws Exception {
        Map<String, Object> b = new HashMap<>();
        b.put("clientMessageId", UUID.randomUUID().toString());
        b.put("type", "PLAN");
        b.put("content", "fake plan");
        mvc.perform(post("/api/conversations/" + conversationId + "/messages").with(as(alice)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(toJson(b)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("PLAN_NOT_ALLOWED"));
        assertThat(planCount()).isZero();
    }

    @Test
    void theCardIsBroadcastOnlyAfterCommit() {
        TransactionTemplate tx = new TransactionTemplate(txManager);
        CreateProposalRequest req = new CreateProposalRequest(nextWeek, TimeSlot.AFTERNOON, LocalTime.of(15, 0),
                "Đi dạo", null, null);

        tx.executeWithoutResult(status -> {
            service.addProposal(invitationId, bob.getId(), req);
            verify(broadcaster, never()).publish(anyLong(), any(), any());
        });
        verify(broadcaster, times(1)).publish(eq(conversationId), eq(ChatEvent.MESSAGE),
                argThat(p -> p instanceof MessageDto m && m.type() == MessageType.PLAN && m.plan() != null
                        && "Đi dạo".equals(m.plan().activity())));

        // A rolled-back suggestion is neither stored nor broadcast.
        clearInvocations(broadcaster);
        tx.executeWithoutResult(status -> {
            service.addProposal(invitationId, bob.getId(), req);
            status.setRollbackOnly();
        });
        verify(broadcaster, never()).publish(anyLong(), any(), any());
        assertThat(planCount()).isEqualTo(1);
    }
}
