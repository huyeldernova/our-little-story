package com.ourlittlestory.chat;

import com.ourlittlestory.image.ImageService.ImageDto;
import com.ourlittlestory.image.StoredImage;
import com.ourlittlestory.invitation.DateInvitation;
import com.ourlittlestory.invitation.DateProposal;
import com.ourlittlestory.invitation.TimeSlot;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/** Request and response bodies for chat, shared by REST and STOMP. */
public final class ChatDtos {

    private ChatDtos() {
    }

    public static final String UUID_REGEX = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$";

    public record SendMessageRequest(
            @NotBlank @Pattern(regexp = UUID_REGEX, message = "must be a UUID") String clientMessageId,
            @NotNull MessageType type,
            @Size(max = 4000) String content,
            @Size(max = 36) String imageId) {
    }

    /** Payload of a STOMP frame sent to /app/chat.send. */
    public record StompSendRequest(
            @NotNull Long conversationId,
            @NotBlank @Pattern(regexp = UUID_REGEX, message = "must be a UUID") String clientMessageId,
            @NotNull MessageType type,
            @Size(max = 4000) String content,
            @Size(max = 36) String imageId) {

        public SendMessageRequest toRequest() {
            return new SendMessageRequest(clientMessageId, type, content, imageId);
        }
    }

    public record TypingRequest(@NotNull Long conversationId, boolean typing) {
    }

    public record ReadRequest(@NotNull @PositiveOrZero Long lastReadMessageId) {
    }

    /**
     * The date-plan card of a PLAN message. Built from the proposal's CURRENT row (not a snapshot),
     * so an older card shows who has agreed and whether it was confirmed.
     */
    public record PlanDto(Long invitationId, Long proposalId, String activity, LocalDate proposedDate,
                          TimeSlot timeSlot, LocalTime specificTime, String location, String note,
                          String proposerName, Long inviterId, Long inviteeId, boolean inviterAgreed,
                          boolean inviteeAgreed, boolean confirmed) {

        public static PlanDto from(DateProposal p) {
            DateInvitation inv = p.getInvitation();
            DateProposal confirmed = inv.getConfirmedProposal();
            return new PlanDto(inv.getId(), p.getId(), p.getActivity(), p.getProposedDate(), p.getTimeSlot(),
                    p.getSpecificTime(), p.getLocation(), p.getNote(), p.getProposer().getDisplayName(),
                    inv.getInviter().getId(), inv.getInvitee().getId(), p.isInviterAgreed(), p.isInviteeAgreed(),
                    confirmed != null && p.getId().equals(confirmed.getId()));
        }
    }

    public record MessageDto(Long id, Long conversationId, Long senderId, String senderName, MessageType type,
                             String content, ImageDto image, String clientMessageId, Instant createdAt,
                             PlanDto plan) {

        public static MessageDto from(Message m) {
            StoredImage img = m.getImage();
            ImageDto imageDto = img == null ? null : new ImageDto(img.getId(), "/api/images/" + img.getId(),
                    img.getContentType(), img.getSizeBytes(), img.getWidth(), img.getHeight());
            PlanDto plan = m.getType() == MessageType.PLAN && m.getProposal() != null
                    ? PlanDto.from(m.getProposal()) : null;
            return new MessageDto(m.getId(), m.getConversation().getId(), m.getSender().getId(),
                    m.getSender().getDisplayName(), m.getType(), m.getContent(), imageDto, m.getClientMessageId(),
                    m.getCreatedAt(), plan);
        }
    }

    public record MessagePage(List<MessageDto> messages, boolean hasMore) {
    }

    public record MemberDto(Long userId, String username, String displayName, boolean online,
                            Long lastReadMessageId) {
    }

    public record ConversationDto(Long id, String title, List<MemberDto> members, MessageDto lastMessage,
                                  long unreadCount) {
    }

    public record ReadReceipt(Long userId, Long lastReadMessageId) {
    }

    public record TypingEvent(Long userId, String displayName, boolean typing) {
    }

    public record PresenceEvent(Long userId, boolean online) {
    }

    /** Envelope for everything published on /topic/conversations/{id}. */
    public record ChatEvent(String type, Long conversationId, Object payload) {
        public static final String MESSAGE = "MESSAGE";
        public static final String TYPING = "TYPING";
        public static final String READ = "READ";
        public static final String PRESENCE = "PRESENCE";
    }

    public record ChatError(String code, String message, String clientMessageId) {
    }
}
