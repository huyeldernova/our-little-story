package com.ourlittlestory.auth;

import com.ourlittlestory.chat.Conversation;
import com.ourlittlestory.chat.ConversationMember;
import com.ourlittlestory.chat.ConversationMemberRepository;
import com.ourlittlestory.chat.ConversationRepository;
import com.ourlittlestory.config.AppProperties;
import com.ourlittlestory.config.AppProperties.BootstrapUser;
import com.ourlittlestory.invitation.DateInvitation;
import com.ourlittlestory.invitation.DateInvitationRepository;
import com.ourlittlestory.user.User;
import com.ourlittlestory.user.UserRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates exactly two accounts and their shared conversation on first start-up.
 * Usernames, display names and initial passwords are read from environment
 * variables (OLS_USER1_*, OLS_USER2_*). There is no registration endpoint.
 * By default it also creates the pending date invitation from user1 to user2.
 * Passwords are never logged.
 */
@Component
public class UserBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(UserBootstrap.class);
    static final int MIN_PASSWORD_LENGTH = 10;

    private final AppProperties props;
    private final UserRepository users;
    private final ConversationRepository conversations;
    private final ConversationMemberRepository members;
    private final PasswordEncoder encoder;
    private final DateInvitationRepository invitations;

    public UserBootstrap(AppProperties props, UserRepository users, ConversationRepository conversations,
                         ConversationMemberRepository members, PasswordEncoder encoder,
                         DateInvitationRepository invitations) {
        this.props = props;
        this.users = users;
        this.conversations = conversations;
        this.members = members;
        this.encoder = encoder;
        this.invitations = invitations;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        AppProperties.Bootstrap cfg = props.bootstrap();
        long count = users.count();
        if (count == 0) {
            if (!valid(cfg.user1()) || !valid(cfg.user2())) {
                log.warn("No users exist yet. Set OLS_USER1_USERNAME/OLS_USER1_PASSWORD and "
                        + "OLS_USER2_USERNAME/OLS_USER2_PASSWORD (passwords >= {} chars) and restart.",
                        MIN_PASSWORD_LENGTH);
                return;
            }
            if (cfg.user1().username().trim().equalsIgnoreCase(cfg.user2().username().trim())) {
                throw new IllegalStateException("OLS_USER1_USERNAME and OLS_USER2_USERNAME must differ");
            }
            User a = users.save(newUser(cfg.user1()));
            User b = users.save(newUser(cfg.user2()));
            Conversation c = conversations.save(new Conversation(cfg.conversationTitle()));
            members.save(new ConversationMember(c, a));
            members.save(new ConversationMember(c, b));
            if (cfg.createInvitation()) {
                // The story's chapter 07 is an invitation from user1 to user2; it starts as PENDING.
                invitations.save(new DateInvitation(a, b, null));
            }
            log.info("Created the two accounts '{}' and '{}' and their conversation.", a.getUsername(),
                    b.getUsername());
            return;
        }
        if (count != 2) {
            log.warn("Expected exactly 2 users but found {}.", count);
        }
        if (cfg.resetPasswords()) {
            for (BootstrapUser u : List.of(cfg.user1(), cfg.user2())) {
                if (!valid(u)) {
                    continue;
                }
                users.findByUsername(u.username().trim()).ifPresent(existing -> {
                    existing.setPasswordHash(encoder.encode(u.password()));
                    users.save(existing);
                    log.info("Password reset from environment for '{}'.", existing.getUsername());
                });
            }
        }
    }

    private User newUser(BootstrapUser u) {
        String display = u.displayName() == null || u.displayName().isBlank() ? u.username().trim()
                : u.displayName().trim();
        return new User(u.username().trim(), display, encoder.encode(u.password()));
    }

    private static boolean valid(BootstrapUser u) {
        return u != null && u.username() != null && !u.username().isBlank()
                && u.password() != null && u.password().length() >= MIN_PASSWORD_LENGTH;
    }
}
