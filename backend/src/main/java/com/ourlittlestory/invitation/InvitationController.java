package com.ourlittlestory.invitation;

import com.ourlittlestory.auth.CurrentUser;
import com.ourlittlestory.invitation.InvitationDtos.CreateInvitationRequest;
import com.ourlittlestory.invitation.InvitationDtos.CreateProposalRequest;
import com.ourlittlestory.invitation.InvitationDtos.InvitationDto;
import com.ourlittlestory.invitation.InvitationDtos.RespondRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/invitations")
@Tag(name = "Invitations")
public class InvitationController {

    private final InvitationService service;

    public InvitationController(InvitationService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Invite the other person on a date")
    public ResponseEntity<InvitationDto> create(@Valid @RequestBody(required = false) CreateInvitationRequest body) {
        String message = body == null ? null : body.message();
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(CurrentUser.id(), message));
    }

    @GetMapping
    @Operation(summary = "Invitations sent or received by the signed-in user, with their proposals")
    public List<InvitationDto> list() {
        return service.list(CurrentUser.id());
    }

    @PostMapping("/{id}/proposals")
    @Operation(summary = "Suggest a plan (date, time slot, optional exact time, activity, place, note)")
    public ResponseEntity<InvitationDto> propose(@PathVariable Long id,
                                                 @Valid @RequestBody CreateProposalRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.addProposal(id, CurrentUser.id(), body));
    }

    @PostMapping("/{id}/proposals/{proposalId}/agree")
    @Operation(summary = "Agree to a proposal; it is confirmed once both people agree to the same one")
    public InvitationDto agree(@PathVariable Long id, @PathVariable Long proposalId) {
        return service.agree(id, proposalId, CurrentUser.id());
    }

    @PostMapping("/{id}/response")
    @Operation(summary = "Invitee answers: ACCEPTED or THINKING")
    public InvitationDto respond(@PathVariable Long id, @Valid @RequestBody RespondRequest body) {
        return service.respond(id, CurrentUser.id(), body.response());
    }
}
