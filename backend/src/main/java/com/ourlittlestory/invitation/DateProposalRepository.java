package com.ourlittlestory.invitation;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DateProposalRepository extends JpaRepository<DateProposal, Long> {

    @Query("select p from DateProposal p join fetch p.proposer where p.invitation.id = :invitationId order by p.id")
    List<DateProposal> findByInvitation(Long invitationId);

    long countByInvitationId(Long invitationId);
}
