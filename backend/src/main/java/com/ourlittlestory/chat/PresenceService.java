package com.ourlittlestory.chat;

import com.ourlittlestory.auth.AppUserPrincipal;
import com.ourlittlestory.chat.ChatDtos.ChatEvent;
import com.ourlittlestory.chat.ChatDtos.PresenceEvent;
import java.security.Principal;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.context.event.EventListener;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

/**
 * Online status derived only from real, open WebSocket sessions: a user is
 * online while at least one of their STOMP sessions is connected.
 */
@Service
public class PresenceService {

    private final Map<Long, Set<String>> sessionsByUser = new ConcurrentHashMap<>();
    private final ConversationMemberRepository members;
    private final ChatBroadcaster broadcaster;

    public PresenceService(ConversationMemberRepository members, ChatBroadcaster broadcaster) {
        this.members = members;
        this.broadcaster = broadcaster;
    }

    public boolean isOnline(Long userId) {
        Set<String> sessions = sessionsByUser.get(userId);
        return sessions != null && !sessions.isEmpty();
    }

    @EventListener
    public void onConnected(SessionConnectedEvent event) {
        Long userId = userId(event.getUser());
        String sessionId = (String) event.getMessage().getHeaders().get("simpSessionId");
        if (userId == null || sessionId == null) {
            return;
        }
        boolean[] cameOnline = {false};
        sessionsByUser.compute(userId, (k, set) -> {
            Set<String> s = set == null ? ConcurrentHashMap.newKeySet() : set;
            cameOnline[0] = s.isEmpty();
            s.add(sessionId);
            return s;
        });
        if (cameOnline[0]) {
            announce(userId, true);
        }
    }

    @EventListener
    public void onDisconnected(SessionDisconnectEvent event) {
        Long userId = userId(event.getUser());
        if (userId == null) {
            return;
        }
        boolean[] wentOffline = {false};
        sessionsByUser.computeIfPresent(userId, (k, set) -> {
            boolean removed = set.remove(event.getSessionId());
            wentOffline[0] = removed && set.isEmpty();
            return set.isEmpty() ? null : set;
        });
        if (wentOffline[0]) {
            announce(userId, false);
        }
    }

    private void announce(Long userId, boolean online) {
        for (ConversationMember m : members.findByUserIdWithConversation(userId)) {
            broadcaster.publish(m.getConversation().getId(), ChatEvent.PRESENCE, new PresenceEvent(userId, online));
        }
    }

    private static Long userId(Principal principal) {
        if (principal instanceof Authentication auth && auth.getPrincipal() instanceof AppUserPrincipal p) {
            return p.getId();
        }
        return null;
    }
}
