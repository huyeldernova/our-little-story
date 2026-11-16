package com.ourlittlestory.invitation;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DateInvitationRepository extends JpaRepository<DateInvitation, Long> {

    @Query("""
            select i from DateInvitation i join fetch i.inviter join fetch i.invitee
            where i.inviter.id = :userId or i.invitee.id = :userId
            order by i.id desc
            """)
    List<DateInvitation> findForUser(Long userId);

    @Query("select i from DateInvitation i join fetch i.inviter join fetch i.invitee where i.id = :id")
    Optional<DateInvitation> findWithUsers(Long id);

    @Query("""
            select count(i) > 0 from DateInvitation i
            where i.confirmedProposal is null
              and ((i.inviter.id = :a and i.invitee.id = :b) or (i.inviter.id = :b and i.invitee.id = :a))
            """)
    boolean existsOpenBetween(Long a, Long b);
}
