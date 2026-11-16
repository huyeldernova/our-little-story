package com.ourlittlestory.chat;

import com.ourlittlestory.image.StoredImage;
import com.ourlittlestory.invitation.DateProposal;
import com.ourlittlestory.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private MessageType type;

    @Column(columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "image_id")
    private StoredImage image;

    /** Set only for PLAN messages; the card always shows the proposal's current state. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposal_id")
    private DateProposal proposal;

    @Column(name = "client_message_id", nullable = false, length = 36)
    private String clientMessageId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected Message() {
    }

    public Message(Conversation conversation, User sender, MessageType type, String content, StoredImage image,
                   String clientMessageId) {
        this.conversation = conversation;
        this.sender = sender;
        this.type = type;
        this.content = content;
        this.image = image;
        this.clientMessageId = clientMessageId;
    }

    /** A PLAN message (server-created) for the given proposal. */
    public static Message plan(Conversation conversation, User sender, DateProposal proposal, String clientMessageId) {
        Message m = new Message(conversation, sender, MessageType.PLAN, null, null, clientMessageId);
        m.proposal = proposal;
        return m;
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Conversation getConversation() {
        return conversation;
    }

    public User getSender() {
        return sender;
    }

    public MessageType getType() {
        return type;
    }

    public String getContent() {
        return content;
    }

    public StoredImage getImage() {
        return image;
    }

    public DateProposal getProposal() {
        return proposal;
    }

    public String getClientMessageId() {
        return clientMessageId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
