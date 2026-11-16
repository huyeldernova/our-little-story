package com.ourlittlestory.invitation;

import com.ourlittlestory.chat.ChatDtos.MessageDto;
import com.ourlittlestory.chat.ChatMessageCreated;
import com.ourlittlestory.chat.Conversation;
import com.ourlittlestory.chat.ConversationMember;
import com.ourlittlestory.chat.ConversationMemberRepository;
import com.ourlittlestory.chat.Message;
import com.ourlittlestory.chat.MessageRepository;
import com.ourlittlestory.common.ApiException;
import com.ourlittlestory.invitation.InvitationDtos.CreateProposalRequest;
import com.ourlittlestory.invitation.InvitationDtos.InvitationDto;
import com.ourlittlestory.invitation.InvitationDtos.ProposalDto;
import com.ourlittlestory.user.User;
import com.ourlittlestory.user.UserDto;
import com.ourlittlestory.user.UserRepository;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Date invitations. The invitee answers ACCEPTED or THINKING; either person can
 * suggest proposals (date, time slot, optional exact time, activity, place, note).
 * A proposal is confirmed only when both people have agreed to that same proposal.
 * <p>
 * A new suggestion, and the confirmation of one, also post a PLAN card into the two people's
 * shared conversation in the SAME transaction; the card is broadcast only after commit
 * (see {@link com.ourlittlestory.chat.ChatMessageCreatedListener}).
 */
@Service
public class InvitationService {

    static final int MAX_PROPOSALS = 30;
    private static final Logger log = LoggerFactory.getLogger(InvitationService.class);

    private final DateInvitationRepository invitations;
    private final DateProposalRepository proposals;
    private final UserRepository users;
    private final ConversationMemberRepository members;
    private final MessageRepository messages;
    private final ApplicationEventPublisher events;
    private final Clock clock;

    @Autowired
    public InvitationService(DateInvitationRepository invitations, DateProposalRepository proposals,
                             UserRepository users, ConversationMemberRepository members,
                             MessageRepository messages, ApplicationEventPublisher events,
                             @Value("${app.time-zone:Asia/Ho_Chi_Minh}") String zone) {
        this(invitations, proposals, users, members, messages, events, Clock.system(ZoneId.of(zone)));
    }

    InvitationService(DateInvitationRepository invitations, DateProposalRepository proposals,
                      UserRepository users, ConversationMemberRepository members,
                      MessageRepository messages, ApplicationEventPublisher events, Clock clock) {
        this.invitations = invitations;
        this.proposals = proposals;
        this.users = users;
        this.members = members;
        this.messages = messages;
        this.events = events;
        this.clock = clock;
    }

    @Transactional
    public InvitationDto create(Long inviterId, String message) {
        User inviter = users.findById(inviterId).orElseThrow(() -> ApiException.notFound("User"));
        // The partner is the other member of the inviter's conversation(s).
        List<User> others = members.findByUserIdWithConversation(inviterId).stream()
                .flatMap(m -> members.findByConversationIdWithUser(m.getConversation().getId()).stream())
                .map(ConversationMember::getUser)
                .filter(u -> !u.getId().equals(inviterId))
                .distinct()
                .toList();
        if (others.size() != 1) {
            throw ApiException.conflict("NO_PARTNER", "There is no one to invite yet");
        }
        User invitee = others.get(0);
        if (invitations.existsOpenBetween(inviterId, invitee.getId())) {
            throw ApiException.conflict("INVITATION_EXISTS", "An invitation is already open");
        }
        String text = message == null || message.isBlank() ? null : message.strip();
        DateInvitation invitation = invitations.save(new DateInvitation(inviter, invitee, text));
        return toDto(invitation, inviterId);
    }

    @Transactional(readOnly = true)
    public List<InvitationDto> list(Long userId) {
        return invitations.findForUser(userId).stream().map(i -> toDto(i, userId)).toList();
    }

    @Transactional
    public InvitationDto addProposal(Long invitationId, Long userId, CreateProposalRequest req) {
        DateInvitation invitation = requireParticipant(invitationId, userId);
        if (invitation.getConfirmedProposal() != null) {
            throw ApiException.conflict("ALREADY_CONFIRMED", "A plan is already confirmed");
        }
        LocalDate today = LocalDate.now(clock);
        if (req.proposedDate().isBefore(today)) {
            throw ApiException.badRequest("DATE_IN_PAST", "Please choose today or a later date");
        }
        if (req.proposedDate().isAfter(today.plusYears(1))) {
            throw ApiException.badRequest("DATE_TOO_FAR", "Please choose a date within a year");
        }
        if (req.specificTime() != null && !req.timeSlot().contains(req.specificTime())) {
            throw ApiException.badRequest("TIME_OUTSIDE_SLOT", "The exact time does not match the time of day");
        }
        if (proposals.countByInvitationId(invitationId) >= MAX_PROPOSALS) {
            throw ApiException.conflict("TOO_MANY_PROPOSALS", "That is a lot of ideas already");
        }
        User proposer = users.getReferenceById(userId);
        DateProposal proposal = new DateProposal(invitation, proposer, req.proposedDate(), req.timeSlot(),
                req.specificTime(), req.activity().strip(), blankToNull(req.location()), blankToNull(req.note()));
        // Suggesting a plan counts as agreeing to it; the other person still has to agree.
        proposal.agree(userId);
        proposals.save(proposal);
        invitation.getProposals().add(proposal);
        postPlanCard(invitation, proposal, proposer);
        return toDto(invitation, userId);
    }

    @Transactional
    public InvitationDto agree(Long invitationId, Long proposalId, Long userId) {
        DateInvitation invitation = requireParticipant(invitationId, userId);
        DateProposal proposal = proposals.findById(proposalId)
                .filter(p -> p.getInvitation().getId().equals(invitationId))
                .orElseThrow(() -> ApiException.notFound("Proposal"));
        DateProposal confirmed = invitation.getConfirmedProposal();
        if (confirmed != null) {
            if (confirmed.getId().equals(proposalId)) {
                return toDto(invitation, userId);
            }
            throw ApiException.conflict("ALREADY_CONFIRMED", "A different plan is already confirmed");
        }
        proposal.agree(userId);
        boolean confirmsNow = proposal.bothAgreed();
        if (confirmsNow) {
            invitation.confirm(proposal);
        }
        invitations.saveAndFlush(invitation);
        if (confirmsNow) {
            postPlanCard(invitation, proposal, users.getReferenceById(userId));
        }
        return toDto(invitation, userId);
    }

    @Transactional
    public InvitationDto respond(Long invitationId, Long userId, InvitationStatus response) {
        DateInvitation invitation = requireParticipant(invitationId, userId);
        if (!invitation.getInvitee().getId().equals(userId)) {
            throw ApiException.forbidden("Only the person invited can answer");
        }
        if (response == InvitationStatus.PENDING) {
            throw ApiException.badRequest("INVALID_RESPONSE", "Answer must be ACCEPTED or THINKING");
        }
        if (invitation.getConfirmedProposal() != null && response != InvitationStatus.ACCEPTED) {
            throw ApiException.conflict("ALREADY_CONFIRMED", "A plan is already confirmed");
        }
        invitation.respond(response);
        invitations.saveAndFlush(invitation);
        return toDto(invitation, userId);
    }

    /**
     * Stores a PLAN message for the proposal in the conversation shared by the two participants
     * (same transaction as the caller) and publishes it for broadcasting after commit.
     */
    private void postPlanCard(DateInvitation invitation, DateProposal proposal, User sender) {
        List<Conversation> shared = members.findSharedConversations(invitation.getInviter().getId(),
                invitation.getInvitee().getId());
        if (shared.isEmpty()) {
            log.warn("Invitation {} has no shared conversation; plan card not posted", invitation.getId());
            return;
        }
        Conversation conversation = shared.get(0);
        Message saved = messages.saveAndFlush(Message.plan(conversation, sender, proposal, UUID.randomUUID().toString()));
        MessageDto dto = MessageDto.from(saved);
        events.publishEvent(new ChatMessageCreated(conversation.getId(), dto));
    }

    private DateInvitation requireParticipant(Long invitationId, Long userId) {
        DateInvitation invitation = invitations.findWithUsers(invitationId)
                .orElseThrow(() -> ApiException.notFound("Invitation"));
        if (!invitation.isParticipant(userId)) {
            throw ApiException.notFound("Invitation");
        }
        return invitation;
    }

    private InvitationDto toDto(DateInvitation i, Long viewerId) {
        Long confirmedId = i.getConfirmedProposal() == null ? null : i.getConfirmedProposal().getId();
        List<ProposalDto> proposalDtos = i.getId() == null ? List.of()
                : proposals.findByInvitation(i.getId()).stream()
                        .map(p -> ProposalDto.from(p, viewerId, confirmedId)).toList();
        return new InvitationDto(i.getId(), UserDto.from(i.getInviter()), UserDto.from(i.getInvitee()),
                i.getMessage(), i.getStatus(), confirmedId, i.getRespondedAt(), i.getConfirmedAt(),
                i.getCreatedAt(), proposalDtos);
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.strip();
    }
}
