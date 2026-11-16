package com.ourlittlestory.invitation;

public enum InvitationStatus {
    /** Sent, not answered yet. */
    PENDING,
    /** The invitee said yes (e.g. "yes, let's meet"). */
    ACCEPTED,
    /** The invitee asked for a little time (e.g. "let me think about it a little"). */
    THINKING
}
