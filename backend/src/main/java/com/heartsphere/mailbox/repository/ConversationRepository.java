package com.heartsphere.mailbox.repository;

import com.heartsphere.mailbox.entity.Conversation;
import com.heartsphere.mailbox.enums.ConversationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 跨时空信箱对话Repository
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    
    /**
     * 根据参与者ID查找对话（参与者在participant1或participant2位置）
     */
    @Query("SELECT c FROM Conversation c WHERE (c.participant1Id = :userId OR c.participant2Id = :userId) ORDER BY c.lastMessageAt DESC NULLS LAST, c.createdAt DESC")
    Page<Conversation> findByParticipantId(@Param("userId") Long userId, Pageable pageable);
    
    /**
     * 根据参与者ID和对话类型查找对话
     */
    @Query("SELECT c FROM Conversation c WHERE (c.participant1Id = :userId OR c.participant2Id = :userId) AND c.conversationType = :type ORDER BY c.lastMessageAt DESC NULLS LAST, c.createdAt DESC")
    Page<Conversation> findByParticipantIdAndType(
        @Param("userId") Long userId, 
        @Param("type") ConversationType type, 
        Pageable pageable
    );
    
    /**
     * 查找两个用户之间的对话
     */
    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.participant1Id = :userId1 AND c.participant2Id = :userId2) OR " +
           "(c.participant1Id = :userId2 AND c.participant2Id = :userId1)")
    Optional<Conversation> findConversationBetweenUsers(
        @Param("userId1") Long userId1, 
        @Param("userId2") Long userId2
    );
    
    /**
     * 根据参与者ID查找有未读消息的对话
     */
    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.participant1Id = :userId AND c.unreadCount1 > 0) OR " +
           "(c.participant2Id = :userId AND c.unreadCount2 > 0) " +
           "ORDER BY c.lastMessageAt DESC NULLS LAST")
    List<Conversation> findUnreadConversationsByUserId(@Param("userId") Long userId);
    
    /**
     * 根据参与者ID查找置顶的对话
     */
    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.participant1Id = :userId AND c.isPinned1 = true) OR " +
           "(c.participant2Id = :userId AND c.isPinned2 = true) " +
           "ORDER BY c.lastMessageAt DESC NULLS LAST")
    List<Conversation> findPinnedConversationsByUserId(@Param("userId") Long userId);
    
    /**
     * 根据对话ID和参与者ID查找对话（确保用户只能访问自己参与的对话）
     */
    @Query("SELECT c FROM Conversation c WHERE c.id = :conversationId AND (c.participant1Id = :userId OR c.participant2Id = :userId)")
    Optional<Conversation> findByIdAndParticipantId(
        @Param("conversationId") Long conversationId, 
        @Param("userId") Long userId
    );
    
    /**
     * 统计用户的未读对话数量
     */
    @Query("SELECT COUNT(c) FROM Conversation c WHERE " +
           "(c.participant1Id = :userId AND c.unreadCount1 > 0) OR " +
           "(c.participant2Id = :userId AND c.unreadCount2 > 0)")
    Long countUnreadConversationsByUserId(@Param("userId") Long userId);
}

