package com.ourlittlestory.chat;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("""
            select m from Message m join fetch m.sender left join fetch m.image
            left join fetch m.proposal p left join fetch p.proposer left join fetch p.invitation
            where m.conversation.id = :conversationId
            order by m.id desc
            """)
    List<Message> findLatest(Long conversationId, Pageable pageable);

    @Query("""
            select m from Message m join fetch m.sender left join fetch m.image
            left join fetch m.proposal p left join fetch p.proposer left join fetch p.invitation
            where m.conversation.id = :conversationId and m.id < :beforeId
            order by m.id desc
            """)
    List<Message> findBefore(Long conversationId, Long beforeId, Pageable pageable);

    @Query("""
            select m from Message m join fetch m.sender left join fetch m.image
            left join fetch m.proposal p left join fetch p.proposer left join fetch p.invitation
            where m.sender.id = :senderId and m.clientMessageId = :clientMessageId
            """)
    Optional<Message> findBySenderAndClientId(Long senderId, String clientMessageId);

    @Query("select max(m.id) from Message m where m.conversation.id = :conversationId")
    Long findMaxId(Long conversationId);

    @Query("""
            select count(m) from Message m
            where m.conversation.id = :conversationId and m.sender.id <> :userId and m.id > :afterId
            """)
    long countUnread(Long conversationId, Long userId, Long afterId);

    boolean existsByIdAndConversationId(Long id, Long conversationId);
}
