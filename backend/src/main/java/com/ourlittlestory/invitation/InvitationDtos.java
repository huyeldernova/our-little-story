package com.ourlittlestory.invitation;

import com.ourlittlestory.user.UserDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public final class InvitationDtos {

    private InvitationDtos() {
    }

    public record CreateInvitationRequest(@Size(max = 1000) String message) {
    }

    public record CreateProposalRequest(
            @NotNull LocalDate proposedDate,
            @NotNull TimeSlot timeSlot,
            LocalTime specificTime,
            @NotBlank @Size(max = 120) String activity,
            @Size(max = 200) String location,
            @Size(max = 500) String note) {
    }

    public record RespondRequest(@NotNull InvitationStatus response) {
    }

    public record ProposalDto(Long id, Long proposerId, String proposerName, LocalDate proposedDate,
                              TimeSlot timeSlot, LocalTime specificTime, String activity, String location,
                              String note, boolean inviterAgreed, boolean inviteeAgreed, boolean agreedByMe,
                              boolean confirmed, Instant createdAt) {

        static ProposalDto from(DateProposal p, Long viewerId, Long confirmedId) {
            return new ProposalDto(p.getId(), p.getProposer().getId(), p.getProposer().getDisplayName(),
                    p.getProposedDate(), p.getTimeSlot(), p.getSpecificTime(), p.getActivity(), p.getLocation(),
                    p.getNote(), p.isInviterAgreed(), p.isInviteeAgreed(), p.agreedBy(viewerId),
                    p.getId().equals(confirmedId), p.getCreatedAt());
        }
    }

    public record InvitationDto(Long id, UserDto inviter, UserDto invitee, String message, InvitationStatus status,
                                Long confirmedProposalId, Instant respondedAt, Instant confirmedAt,
                                Instant createdAt, List<ProposalDto> proposals) {
    }
}
