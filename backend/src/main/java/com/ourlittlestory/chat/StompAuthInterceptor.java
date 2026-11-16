package com.ourlittlestory.chat;

import com.ourlittlestory.auth.AppUserPrincipal;
import java.security.Principal;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * Authorises every inbound STOMP frame:
 * CONNECT needs the authenticated user from the HTTP session;
 * SUBSCRIBE is allowed only to conversations the user belongs to (and to their own error queue);
 * SEND is allowed only to /app/** (membership is re-checked by the handlers).
 */
@Component
public class StompAuthInterceptor implements ChannelInterceptor {

    private static final Pattern CONVERSATION_TOPIC = Pattern.compile("^/topic/conversations/(\\d{1,18})$");

    private final ConversationMemberRepository members;

    public StompAuthInterceptor(@Lazy ConversationMemberRepository members) {
        this.members = members;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }
        StompCommand command = accessor.getCommand();
        switch (command) {
            case CONNECT, STOMP -> requireUser(accessor.getUser());
            case SUBSCRIBE -> {
                Long userId = requireUser(accessor.getUser());
                String destination = accessor.getDestination();
                if (destination == null) {
                    throw new MessageDeliveryException("Missing destination");
                }
                if (destination.equals("/user/queue/errors")) {
                    break;
                }
                Matcher m = CONVERSATION_TOPIC.matcher(destination);
                if (!m.matches() || !members.existsByConversationIdAndUserId(Long.parseLong(m.group(1)), userId)) {
                    throw new MessageDeliveryException("Subscription not allowed");
                }
            }
            case SEND -> {
                requireUser(accessor.getUser());
                String destination = accessor.getDestination();
                if (destination == null || !destination.startsWith("/app/")) {
                    throw new MessageDeliveryException("Destination not allowed");
                }
            }
            default -> {
                // DISCONNECT, UNSUBSCRIBE, ACK... need no extra checks
            }
        }
        return message;
    }

    private static Long requireUser(Principal principal) {
        if (principal instanceof Authentication auth && auth.isAuthenticated()
                && auth.getPrincipal() instanceof AppUserPrincipal p) {
            return p.getId();
        }
        throw new MessageDeliveryException("Not authenticated");
    }
}
