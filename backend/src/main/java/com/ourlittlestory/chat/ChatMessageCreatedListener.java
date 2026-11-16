package com.ourlittlestory.chat;

import com.ourlittlestory.chat.ChatDtos.ChatEvent;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/** Broadcasts server-created messages AFTER COMMIT, so nobody sees a message that was rolled back. */
@Component
public class ChatMessageCreatedListener {

    private final ChatBroadcaster broadcaster;

    public ChatMessageCreatedListener(ChatBroadcaster broadcaster) {
        this.broadcaster = broadcaster;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onCreated(ChatMessageCreated event) {
        broadcaster.publish(event.conversationId(), ChatEvent.MESSAGE, event.message());
    }
}
