package com.ourlittlestory.chat;

import com.ourlittlestory.chat.ChatDtos.MessageDto;

/**
 * Published inside the transaction that stored a server-created message (e.g. a PLAN card).
 * {@link ChatMessageCreatedListener} broadcasts it only after that transaction commits.
 */
public record ChatMessageCreated(Long conversationId, MessageDto message) {
}
