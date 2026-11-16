package com.ourlittlestory.invitation;

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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "date_invitations")
public class DateInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "inviter_id", nullable = false)
    private User inviter;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invitee_id", nullable = false)
    private User invitee;

    @Column(length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private InvitationStatus status = InvitationStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "confirmed_proposal_id")
    private DateProposal confirmedProposal;

    @Column(name = "responded_at")
    private Instant respondedAt;

    @Column(name = "confirmed_at")
    private Instant confirmedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    private long version;

    @OneToMany(mappedBy = "invitation")
    @OrderBy("id ASC")
    private List<DateProposal> proposals = new ArrayList<>();

    protected DateInvitation() {
    }

    public DateInvitation(User inviter, User invitee, String message) {
        this.inviter = inviter;
        this.invitee = invitee;
        this.message = message;
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public boolean isParticipant(Long userId) {
        return inviter.getId().equals(userId) || invitee.getId().equals(userId);
    }

    public Long getId() {
        return id;
    }

    public User getInviter() {
        return inviter;
    }

    public User getInvitee() {
        return invitee;
    }

    public String getMessage() {
        return message;
    }

    public InvitationStatus getStatus() {
        return status;
    }

    public void respond(InvitationStatus status) {
        this.status = status;
        this.respondedAt = Instant.now();
    }

    public DateProposal getConfirmedProposal() {
        return confirmedProposal;
    }

    public void confirm(DateProposal proposal) {
        this.confirmedProposal = proposal;
        this.confirmedAt = Instant.now();
        this.status = InvitationStatus.ACCEPTED;
        if (this.respondedAt == null) {
            this.respondedAt = this.confirmedAt;
        }
    }

    public Instant getRespondedAt() {
        return respondedAt;
    }

    public Instant getConfirmedAt() {
        return confirmedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public List<DateProposal> getProposals() {
        return proposals;
    }
}
