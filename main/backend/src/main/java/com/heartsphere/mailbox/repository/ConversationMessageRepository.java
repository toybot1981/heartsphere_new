package com.heartsphere.mailbox.repository;

import com.heartsphere.mailbox.entity.ConversationMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 跨时空信箱对话消息Repository
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Repository
public interface ConversationMessageRepository extends JpaRepository<ConversationMessage, Long> {
    
    /**
     * 根据对话ID查找所有消息（按创建时间正序，用于对话显示）
     */
    Page<ConversationMessage> findByConversationIdAndIsDeletedFalseOrderByCreatedAtAsc(
        Long conversationId, 
        Pageable pageable
    );
    
    /**
     * 根据对话ID查找所有消息（按创建时间倒序，用于最新消息查询）
     */
    List<ConversationMessage> findByConversationIdAndIsDeletedFalseOrderByCreatedAtDesc(
        Long conversationId
    );
    
    /**
     * 根据对话ID查找最后一条消息
     */
    @Query("SELECT m FROM ConversationMessage m WHERE m.conversationId = :conversationId AND m.isDeleted = false ORDER BY m.createdAt DESC")
    Optional<ConversationMessage> findLastMessageByConversationId(@Param("conversationId") Long conversationId);
    
    /**
     * 根据对话ID和发送者ID查找消息
     */
    Page<ConversationMessage> findByConversationIdAndSenderIdAndIsDeletedFalseOrderByCreatedAtDesc(
        Long conversationId, 
        Long senderId, 
        Pageable pageable
    );
    
    /**
     * 根据回复的消息ID查找所有回复
     */
    List<ConversationMessage> findByReplyToIdAndIsDeletedFalseOrderByCreatedAtAsc(Long replyToId);
    
    /**
     * 根据消息类型查找消息
     */
    Page<ConversationMessage> findByConversationIdAndMessageTypeAndIsDeletedFalseOrderByCreatedAtDesc(
        Long conversationId, 
        String messageType, 
        Pageable pageable
    );
    
    /**
     * 统计对话中的消息数量
     */
    @Query("SELECT COUNT(m) FROM ConversationMessage m WHERE m.conversationId = :conversationId AND m.isDeleted = false")
    Long countMessagesByConversationId(@Param("conversationId") Long conversationId);
    
    /**
     * 根据ID和对话ID查找消息（确保消息属于指定对话）
     */
    Optional<ConversationMessage> findByIdAndConversationId(Long id, Long conversationId);
    
    /**
     * 根据对话ID和时间范围查找消息
     */
    @Query("SELECT m FROM ConversationMessage m WHERE m.conversationId = :conversationId AND m.isDeleted = false AND m.createdAt BETWEEN :startDate AND :endDate ORDER BY m.createdAt DESC")
    List<ConversationMessage> findByConversationIdAndDateRange(
        @Param("conversationId") Long conversationId,
        @Param("startDate") java.time.LocalDateTime startDate,
        @Param("endDate") java.time.LocalDateTime endDate
    );
    
    /**
     * 根据对话ID查找所有未删除的消息（用于批量操作）
     */
    List<ConversationMessage> findByConversationIdAndIsDeletedFalse(Long conversationId);
}


