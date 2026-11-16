package com.ourlittlestory;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ourlittlestory.auth.AppUserPrincipal;
import com.ourlittlestory.chat.Conversation;
import com.ourlittlestory.chat.ConversationMember;
import com.ourlittlestory.chat.ConversationMemberRepository;
import com.ourlittlestory.chat.ConversationRepository;
import com.ourlittlestory.user.User;
import com.ourlittlestory.user.UserRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class IntegrationTestBase {

    @Autowired
    protected MockMvc mvc;
    @Autowired
    protected ObjectMapper json;
    @Autowired
    protected UserRepository users;
    @Autowired
    protected ConversationRepository conversations;
    @Autowired
    protected ConversationMemberRepository members;
    @Autowired
    protected PasswordEncoder encoder;
    @Autowired
    protected JdbcTemplate jdbc;

    protected User alice;
    protected User bob;
    protected Long conversationId;

    @BeforeEach
    void resetData() {
        jdbc.update("update date_invitations set confirmed_proposal_id = null");
        jdbc.update("delete from messages"); // PLAN messages reference date_proposals
        jdbc.update("delete from date_proposals");
        jdbc.update("delete from date_invitations");
        jdbc.update("delete from stored_images");
        jdbc.update("update conversation_members set last_read_message_id = null");
        alice = users.findByUsername("alice").orElseThrow();
        bob = users.findByUsername("bob").orElseThrow();
        conversationId = members.findByUserIdWithConversation(alice.getId()).get(0).getConversation().getId();
    }

    protected static RequestPostProcessor as(User u) {
        AppUserPrincipal p = new AppUserPrincipal(u.getId(), u.getUsername(), u.getDisplayName(), null);
        return authentication(UsernamePasswordAuthenticationToken.authenticated(p, null, p.getAuthorities()));
    }

    /** A third user with their own conversation, used to check access control. Created once. */
    protected User outsider() {
        return users.findByUsername("mallory").orElseGet(() -> {
            User m = users.save(new User("mallory", "Mallory", encoder.encode("outsider-password")));
            Conversation c = conversations.save(new Conversation("Other"));
            members.save(new ConversationMember(c, m));
            return m;
        });
    }

    protected JsonNode body(MvcResult r) throws Exception {
        return json.readTree(r.getResponse().getContentAsByteArray());
    }

    protected String toJson(Object o) throws Exception {
        return json.writeValueAsString(o);
    }

    protected static <T> List<T> list(T... items) {
        return List.of(items);
    }
}
