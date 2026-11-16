package com.ourlittlestory.invitation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.ourlittlestory.IntegrationTestBase;
import com.ourlittlestory.user.User;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

class InvitationIntegrationTest extends IntegrationTestBase {

    private final LocalDate nextWeek = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(7);

    private long createInvitation() throws Exception {
        return body(mvc.perform(post("/api/invitations").with(as(alice)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"message\":\"Mình gặp nhau nhé?\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.inviter.username").value("alice"))
                .andExpect(jsonPath("$.invitee.username").value("bob"))
                .andReturn()).get("id").asLong();
    }

    private ResultActions propose(User u, long invId, LocalDate date, String slot, String time) throws Exception {
        Map<String, Object> b = new HashMap<>();
        b.put("proposedDate", date.toString());
        b.put("timeSlot", slot);
        b.put("specificTime", time);
        b.put("activity", "Đi cà phê");
        b.put("location", "Một quán nhỏ");
        b.put("note", "Không cần cầu kỳ");
        return mvc.perform(post("/api/invitations/" + invId + "/proposals").with(as(u)).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content(toJson(b)));
    }

    private ResultActions respond(User u, long invId, String answer) throws Exception {
        return mvc.perform(post("/api/invitations/" + invId + "/response").with(as(u)).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"response\":\"" + answer + "\"}"));
    }

    private ResultActions agree(User u, long invId, long proposalId) throws Exception {
        return mvc.perform(post("/api/invitations/" + invId + "/proposals/" + proposalId + "/agree")
                .with(as(u)).with(csrf()));
    }

    @Test
    void inviteeCanAnswerThinkingThenAccepted() throws Exception {
        long id = createInvitation();
        respond(alice, id, "ACCEPTED").andExpect(status().isForbidden());
        respond(bob, id, "PENDING").andExpect(status().isBadRequest());
        respond(bob, id, "THINKING").andExpect(status().isOk()).andExpect(jsonPath("$.status").value("THINKING"));
        respond(bob, id, "ACCEPTED").andExpect(status().isOk()).andExpect(jsonPath("$.status").value("ACCEPTED"));
        mvc.perform(get("/api/invitations").with(as(alice)))
                .andExpect(jsonPath("$[0].status").value("ACCEPTED"))
                .andExpect(jsonPath("$[0].message").value("Mình gặp nhau nhé?"));
    }

    @Test
    void onlyOneOpenInvitationAtATime() throws Exception {
        createInvitation();
        mvc.perform(post("/api/invitations").with(as(bob)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isConflict());
    }

    @Test
    void planIsConfirmedOnlyWhenBothAgreeToTheSameProposal() throws Exception {
        long id = createInvitation();
        JsonNode afterA = body(propose(alice, id, nextWeek, "EVENING", "19:00").andExpect(status().isCreated())
                .andReturn());
        long pA = afterA.get("proposals").get(0).get("id").asLong();
        assertThat(afterA.get("proposals").get(0).get("inviterAgreed").asBoolean()).isTrue();
        assertThat(afterA.get("proposals").get(0).get("inviteeAgreed").asBoolean()).isFalse();
        assertThat(afterA.get("confirmedProposalId").isNull()).isTrue();

        JsonNode afterB = body(propose(bob, id, nextWeek.plusDays(1), "AFTERNOON", null)
                .andExpect(status().isCreated()).andReturn());
        long pB = afterB.get("proposals").get(1).get("id").asLong();
        assertThat(afterB.get("confirmedProposalId").isNull()).as("different proposals do not confirm").isTrue();

        // Agreeing again to your own proposal changes nothing.
        agree(alice, id, pA).andExpect(jsonPath("$.confirmedProposalId").doesNotExist());

        agree(bob, id, pA).andExpect(status().isOk())
                .andExpect(jsonPath("$.confirmedProposalId").value(pA))
                .andExpect(jsonPath("$.status").value("ACCEPTED"))
                .andExpect(jsonPath("$.proposals[0].confirmed").value(true));

        agree(alice, id, pB).andExpect(status().isConflict());
        propose(alice, id, nextWeek, "MORNING", null).andExpect(status().isConflict());
        respond(bob, id, "THINKING").andExpect(status().isConflict());
        agree(bob, id, pA).andExpect(status().isOk());
    }

    @Test
    void proposalValidation() throws Exception {
        long id = createInvitation();
        propose(alice, id, LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).minusDays(1), "EVENING", null)
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("DATE_IN_PAST"));
        propose(alice, id, nextWeek, "MORNING", "20:00")
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("TIME_OUTSIDE_SLOT"));
        propose(alice, id, nextWeek, "LUNCH", null).andExpect(status().isBadRequest());
        mvc.perform(post("/api/invitations/" + id + "/proposals").with(as(alice)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"proposedDate\":\"" + nextWeek + "\",\"timeSlot\":\"EVENING\",\"activity\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.activity").exists());
    }

    @Test
    void outsidersCannotSeeOrTouchInvitations() throws Exception {
        long id = createInvitation();
        User mallory = outsider();
        mvc.perform(get("/api/invitations").with(as(mallory))).andExpect(jsonPath("$.length()").value(0));
        respond(mallory, id, "ACCEPTED").andExpect(status().isNotFound());
        propose(mallory, id, nextWeek, "EVENING", null).andExpect(status().isNotFound());
    }
}
