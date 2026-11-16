package com.ourlittlestory.chat;

import com.ourlittlestory.chat.ChatDtos.ChatEvent;
import com.ourlittlestory.chat.ChatDtos.ConversationDto;
import com.ourlittlestory.chat.ChatDtos.MemberDto;
import com.ourlittlestory.chat.ChatDtos.MessageDto;
import com.ourlittlestory.chat.ChatDtos.MessagePage;
import com.ourlittlestory.chat.ChatDtos.ReadReceipt;
import com.ourlittlestory.chat.ChatDtos.SendMessageRequest;
import com.ourlittlestory.chat.ChatDtos.TypingEvent;
import com.ourlittlestory.common.ApiException;
import com.ourlittlestory.image.ImageService;
import com.ourlittlestory.image.StoredImage;
import com.ourlittlestory.user.User;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

@Service
public class ChatService {

    public static final int MAX_TEXT = 4000;
    public static final int MAX_NOTE = 2000;
    public static final int MAX_CAPTION = 500;
    public static final int DEFAULT_PAGE = 30;
    public static final int MAX_PAGE = 100;

    private final ConversationMemberRepository members;
    private final MessageRepository messages;
    private final ImageService images;
    private final PresenceService presence;
    private final ChatBroadcaster broadcaster;
    private final TransactionTemplate tx;

    public ChatService(ConversationMemberRepository members, MessageRepository messages, ImageService images,
                       PresenceService presence, ChatBroadcaster broadcaster, PlatformTransactionManager txManager) {
        this.members = members;
        this.messages = messages;
        this.images = images;
        this.presence = presence;
        this.broadcaster = broadcaster;
        this.tx = new TransactionTemplate(txManager);
    }

    /** Returns the membership row, or 404 so non-members cannot probe which conversations exist. */
    public ConversationMember requireMember(Long conversationId, Long userId) {
        return members.findByConversationIdAndUserId(conversationId, userId)
                .orElseThrow(() -> ApiException.notFound("Conversation"));
    }

    public boolean isMember(Long conversationId, Long userId) {
        return members.existsByConversationIdAndUserId(conversationId, userId);
    }

    @Transactional(readOnly = true)
    public List<ConversationDto> listConversations(Long userId) {
        List<ConversationDto> result = new ArrayList<>();
        for (ConversationMember mine : members.findByUserIdWithConversation(userId)) {
            Conversation c = mine.getConversation();
            List<MemberDto> memberDtos = members.findByConversationIdWithUser(c.getId()).stream()
                    .map(m -> new MemberDto(m.getUser().getId(), m.getUser().getUsername(),
                            m.getUser().getDisplayName(), presence.isOnline(m.getUser().getId()),
                            m.getLastReadMessageId()))
                    .toList();
            MessageDto last = messages.findLatest(c.getId(), PageRequest.of(0, 1)).stream()
                    .findFirst().map(MessageDto::from).orElse(null);
            long lastRead = mine.getLastReadMessageId() == null ? 0L : mine.getLastReadMessageId();
            long unread = messages.countUnread(c.getId(), userId, lastRead);
            result.add(new ConversationDto(c.getId(), c.getTitle(), memberDtos, last, unread));
        }
        return result;
    }

    /** Newest-first keyset pagination; each page is returned oldest-first for display. */
    @Transactional(readOnly = true)
    public MessagePage history(Long conversationId, Long userId, Long beforeId, Integer limit) {
        requireMember(conversationId, userId);
        int size = limit == null ? DEFAULT_PAGE : Math.max(1, Math.min(limit, MAX_PAGE));
        PageRequest page = PageRequest.of(0, size + 1);
        List<Message> rows = beforeId == null
                ? messages.findLatest(conversationId, page)
                : messages.findBefore(conversationId, beforeId, page);
        boolean hasMore = rows.size() > size;
        List<MessageDto> dtos = new ArrayList<>(rows.stream().limit(size).map(MessageDto::from).toList());
        Collections.reverse(dtos);
        return new MessagePage(dtos, hasMore);
    }

    /**
     * Persists a message, commits, and only then broadcasts it. Re-sending the same
     * clientMessageId returns the already stored message instead of a duplicate.
     */
    public MessageDto send(Long conversationId, Long senderId, SendMessageRequest req) {
        if (req.type() == MessageType.PLAN) {
            // Plan cards only come from InvitationService (a new or confirmed suggestion).
            throw ApiException.badRequest("PLAN_NOT_ALLOWED", "Plan cards are created by the server from a suggestion");
        }
        String clientId = req.clientMessageId().toLowerCase(Locale.ROOT);
        MessageDto saved;
        try {
            saved = tx.execute(status -> {
                ConversationMember member = requireMember(conversationId, senderId);
                var existing = messages.findBySenderAndClientId(senderId, clientId);
                if (existing.isPresent()) {
                    Message m = existing.get();
                    if (!m.getConversation().getId().equals(conversationId)) {
                        throw ApiException.conflict("DUPLICATE_CLIENT_ID", "clientMessageId already used");
                    }
                    return MessageDto.from(m);
                }
                Message message = build(member, senderId, req, clientId);
                return MessageDto.from(messages.saveAndFlush(message));
            });
        } catch (DataIntegrityViolationException race) {
            // A concurrent request with the same clientMessageId won the insert.
            saved = tx.execute(status -> messages.findBySenderAndClientId(senderId, clientId)
                    .map(MessageDto::from)
                    .orElseThrow(() -> race));
        }
        broadcaster.publish(conversationId, ChatEvent.MESSAGE, saved);
        return saved;
    }

    private Message build(ConversationMember member, Long senderId, SendMessageRequest req, String clientId) {
        String content = req.content() == null ? null : req.content().strip();
        StoredImage image = null;
        switch (req.type()) {
            case TEXT -> {
                if (content == null || content.isEmpty()) {
                    throw ApiException.badRequest("EMPTY_MESSAGE", "Message cannot be empty");
                }
                if (content.length() > MAX_TEXT) {
                    throw ApiException.badRequest("MESSAGE_TOO_LONG", "Message is too long");
                }
                if (req.imageId() != null) {
                    throw ApiException.badRequest("UNEXPECTED_IMAGE", "Text messages cannot carry an image");
                }
            }
            case NOTE -> {
                if (content == null || content.isEmpty()) {
                    throw ApiException.badRequest("EMPTY_MESSAGE", "Note cannot be empty");
                }
                if (content.length() > MAX_NOTE) {
                    throw ApiException.badRequest("MESSAGE_TOO_LONG", "Note is too long");
                }
                if (req.imageId() != null) {
                    throw ApiException.badRequest("UNEXPECTED_IMAGE", "Notes cannot carry an image");
                }
            }
            case PLAN -> throw ApiException.badRequest("PLAN_NOT_ALLOWED",
                    "Plan cards are created by the server from a suggestion");
            case IMAGE -> {
                if (req.imageId() == null) {
                    throw ApiException.badRequest("MISSING_IMAGE", "imageId is required for IMAGE messages");
                }
                if (content != null && content.length() > MAX_CAPTION) {
                    throw ApiException.badRequest("MESSAGE_TOO_LONG", "Caption is too long");
                }
                image = images.requireOwnedImage(req.imageId(), senderId);
                if (content != null && content.isEmpty()) {
                    content = null;
                }
            }
        }
        User sender = member.getUser();
        return new Message(member.getConversation(), sender, req.type(), content, image, clientId);
    }

    /** Moves the read marker forward (never backwards) and broadcasts a read receipt. */
    public ReadReceipt markRead(Long conversationId, Long userId, Long lastReadMessageId) {
        ReadReceipt receipt = tx.execute(status -> {
            ConversationMember member = requireMember(conversationId, userId);
            if (lastReadMessageId > 0 && !messages.existsByIdAndConversationId(lastReadMessageId, conversationId)) {
                throw ApiException.badRequest("INVALID_MESSAGE", "Message does not belong to this conversation");
            }
            Long current = member.getLastReadMessageId();
            if (current == null || lastReadMessageId > current) {
                member.setLastReadMessageId(lastReadMessageId);
                members.save(member);
            }
            return new ReadReceipt(userId, member.getLastReadMessageId());
        });
        broadcaster.publish(conversationId, ChatEvent.READ, receipt);
        return receipt;
    }

    public void typing(Long conversationId, Long userId, String displayName, boolean typing) {
        if (!isMember(conversationId, userId)) {
            throw ApiException.notFound("Conversation");
        }
        broadcaster.publish(conversationId, ChatEvent.TYPING, new TypingEvent(userId, displayName, typing));
    }
}
