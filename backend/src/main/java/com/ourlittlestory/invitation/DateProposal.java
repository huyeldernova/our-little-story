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
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "date_proposals")
public class DateProposal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invitation_id", nullable = false)
    private DateInvitation invitation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "proposer_id", nullable = false)
    private User proposer;

    @Column(name = "proposed_date", nullable = false)
    private LocalDate proposedDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "time_slot", nullable = false, length = 10)
    private TimeSlot timeSlot;

    @Column(name = "specific_time")
    private LocalTime specificTime;

    @Column(nullable = false, length = 120)
    private String activity;

    @Column(length = 200)
    private String location;

    @Column(length = 500)
    private String note;

    @Column(name = "inviter_agreed", nullable = false)
    private boolean inviterAgreed;

    @Column(name = "invitee_agreed", nullable = false)
    private boolean inviteeAgreed;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected DateProposal() {
    }

    public DateProposal(DateInvitation invitation, User proposer, LocalDate proposedDate, TimeSlot timeSlot,
                        LocalTime specificTime, String activity, String location, String note) {
        this.invitation = invitation;
        this.proposer = proposer;
        this.proposedDate = proposedDate;
        this.timeSlot = timeSlot;
        this.specificTime = specificTime;
        this.activity = activity;
        this.location = location;
        this.note = note;
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    /** Records that this participant agrees to the proposal. */
    public void agree(Long userId) {
        if (invitation.getInviter().getId().equals(userId)) {
            inviterAgreed = true;
        } else if (invitation.getInvitee().getId().equals(userId)) {
            inviteeAgreed = true;
        } else {
            throw new IllegalArgumentException("Not a participant");
        }
    }

    public boolean agreedBy(Long userId) {
        if (invitation.getInviter().getId().equals(userId)) {
            return inviterAgreed;
        }
        if (invitation.getInvitee().getId().equals(userId)) {
            return inviteeAgreed;
        }
        return false;
    }

    public boolean bothAgreed() {
        return inviterAgreed && inviteeAgreed;
    }

    public Long getId() {
        return id;
    }

    public DateInvitation getInvitation() {
        return invitation;
    }

    public User getProposer() {
        return proposer;
    }

    public LocalDate getProposedDate() {
        return proposedDate;
    }

    public TimeSlot getTimeSlot() {
        return timeSlot;
    }

    public LocalTime getSpecificTime() {
        return specificTime;
    }

    public String getActivity() {
        return activity;
    }

    public String getLocation() {
        return location;
    }

    public String getNote() {
        return note;
    }

    public boolean isInviterAgreed() {
        return inviterAgreed;
    }

    public boolean isInviteeAgreed() {
        return inviteeAgreed;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
