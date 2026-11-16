package com.ourlittlestory.chat;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ConversationMemberRepository extends JpaRepository<ConversationMember, Long> {

    @Query("select m from ConversationMember m join fetch m.user where m.conversation.id = :conversationId")
    List<ConversationMember> findByConversationIdWithUser(Long conversationId);

    @Query("select m from ConversationMember m join fetch m.conversation where m.user.id = :userId")
    List<ConversationMember> findByUserIdWithConversation(Long userId);

    Optional<ConversationMember> findByConversationIdAndUserId(Long conversationId, Long userId);

    boolean existsByConversationIdAndUserId(Long conversationId, Long userId);

    /** True when the two users share at least one conversation. */
    @Query("""
            select count(a) > 0 from ConversationMember a, ConversationMember b
            where a.conversation.id = b.conversation.id and a.user.id = :userA and b.user.id = :userB
            """)
    boolean shareConversation(Long userA, Long userB);

    /** Conversations both users are members of, oldest first. */
    @Query("""
            select a.conversation from ConversationMember a, ConversationMember b
            where a.conversation.id = b.conversation.id and a.user.id = :userA and b.user.id = :userB
            order by a.conversation.id asc
            """)
    List<Conversation> findSharedConversations(Long userA, Long userB);
}
