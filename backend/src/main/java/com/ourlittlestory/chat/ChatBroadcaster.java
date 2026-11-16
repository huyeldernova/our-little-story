package com.ourlittlestory.chat;

import com.ourlittlestory.chat.ChatDtos.ChatEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/** Publishes chat events to /topic/conversations/{conversationId}. */
@Component
public class ChatBroadcaster {

    public static final String TOPIC_PREFIX = "/topic/conversations/";

    private final SimpMessagingTemplate template;

    public ChatBroadcaster(SimpMessagingTemplate template) {
        this.template = template;
    }

    public void publish(Long conversationId, String type, Object payload) {
        template.convertAndSend(TOPIC_PREFIX + conversationId, new ChatEvent(type, conversationId, payload));
    }
}
