package com.heartsphere.mailbox.repository;

import com.heartsphere.mailbox.entity.MailboxMessage;
import com.heartsphere.mailbox.enums.MessageCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 跨时空信箱消息Repository
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Repository
public interface MailboxMessageRepository extends JpaRepository<MailboxMessage, Long> {
    
    /**
     * 根据接收者ID查找所有消息（按创建时间倒序）
     */
    Page<MailboxMessage> findByReceiverIdOrderByCreatedAtDesc(Long receiverId, Pageable pageable);
    
    /**
     * 根据接收者ID和分类查找消息
     */
    Page<MailboxMessage> findByReceiverIdAndMessageCategoryOrderByCreatedAtDesc(
        Long receiverId, 
        MessageCategory category, 
        Pageable pageable
    );
    
    /**
     * 根据接收者ID和已读状态查找消息
     */
    Page<MailboxMessage> findByReceiverIdAndIsReadOrderByCreatedAtDesc(
        Long receiverId, 
        Boolean isRead, 
        Pageable pageable
    );
    
    /**
     * 根据接收者ID查找未读消息数量
     */
    @Query("SELECT COUNT(m) FROM MailboxMessage m WHERE m.receiverId = :receiverId AND m.isRead = false AND m.deletedAt IS NULL")
    Long countUnreadMessagesByReceiverId(@Param("receiverId") Long receiverId);
    
    /**
     * 根据接收者ID和分类查找未读消息数量
     */
    @Query("SELECT COUNT(m) FROM MailboxMessage m WHERE m.receiverId = :receiverId AND m.messageCategory = :category AND m.isRead = false AND m.deletedAt IS NULL")
    Long countUnreadMessagesByReceiverIdAndCategory(
        @Param("receiverId") Long receiverId, 
        @Param("category") MessageCategory category
    );
    
    /**
     * 根据接收者ID查找未删除的消息
     */
    @Query("SELECT m FROM MailboxMessage m WHERE m.receiverId = :receiverId AND m.deletedAt IS NULL ORDER BY m.createdAt DESC")
    Page<MailboxMessage> findNotDeletedByReceiverId(@Param("receiverId") Long receiverId, Pageable pageable);
    
    /**
     * 根据ID和接收者ID查找消息（确保用户只能访问自己的消息）
     */
    Optional<MailboxMessage> findByIdAndReceiverId(Long id, Long receiverId);
    
    /**
     * 根据接收者ID、分类和是否重要查找消息
     */
    Page<MailboxMessage> findByReceiverIdAndMessageCategoryAndIsImportantOrderByCreatedAtDesc(
        Long receiverId, 
        MessageCategory category, 
        Boolean isImportant, 
        Pageable pageable
    );
    
    /**
     * 根据接收者ID查找收藏的消息
     */
    Page<MailboxMessage> findByReceiverIdAndIsStarredTrueOrderByCreatedAtDesc(
        Long receiverId, 
        Pageable pageable
    );
    
    /**
     * 根据接收者ID和时间范围查找消息
     */
    @Query("SELECT m FROM MailboxMessage m WHERE m.receiverId = :receiverId AND m.deletedAt IS NULL AND m.createdAt BETWEEN :startDate AND :endDate ORDER BY m.createdAt DESC")
    Page<MailboxMessage> findByReceiverIdAndDateRange(
        @Param("receiverId") Long receiverId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );
    
    /**
     * 搜索消息（按标题或内容）
     */
    @Query("SELECT m FROM MailboxMessage m WHERE m.receiverId = :receiverId AND m.deletedAt IS NULL AND (m.title LIKE %:keyword% OR m.content LIKE %:keyword%) ORDER BY m.createdAt DESC")
    Page<MailboxMessage> searchMessages(
        @Param("receiverId") Long receiverId,
        @Param("keyword") String keyword,
        Pageable pageable
    );
    
    /**
     * 根据发送者类型和ID查找消息
     */
    List<MailboxMessage> findBySenderTypeAndSenderIdOrderByCreatedAtDesc(
        String senderType, 
        Long senderId
    );
    
    /**
     * 根据关联对象查找消息
     */
    List<MailboxMessage> findByRelatedTypeAndRelatedIdOrderByCreatedAtDesc(
        String relatedType, 
        Long relatedId
    );
    
    /**
     * 根据回复的消息ID查找所有回复
     */
    List<MailboxMessage> findByReplyToIdOrderByCreatedAtAsc(Long replyToId);
    
    /**
     * 批量查找消息
     */
    List<MailboxMessage> findByIdInAndReceiverId(List<Long> ids, Long receiverId);
    
    /**
     * 根据接收者ID、消息分类、消息类型、关联ID和关联类型查找消息（用于共鸣消息聚合）
     */
    @Query("SELECT m FROM MailboxMessage m WHERE m.receiverId = :receiverId " +
           "AND m.messageCategory = :category AND m.messageType = :messageType " +
           "AND m.relatedId = :relatedId AND m.relatedType = :relatedType " +
           "AND m.deletedAt IS NULL ORDER BY m.createdAt DESC")
    List<MailboxMessage> findByReceiverIdAndMessageCategoryAndMessageTypeAndRelatedIdAndRelatedTypeOrderByCreatedAtDesc(
        @Param("receiverId") Long receiverId,
        @Param("category") MessageCategory category,
        @Param("messageType") String messageType,
        @Param("relatedId") Long relatedId,
        @Param("relatedType") String relatedType
    );
    
    /**
     * 统计接收者的未读消息数量
     */
    @Query("SELECT COUNT(m) FROM MailboxMessage m WHERE m.receiverId = :receiverId AND m.isRead = false AND m.deletedAt IS NULL")
    long countByReceiverIdAndIsReadFalse(@Param("receiverId") Long receiverId);
    
    /**
     * 根据分类统计接收者的未读消息数量
     */
    @Query("SELECT COUNT(m) FROM MailboxMessage m WHERE m.receiverId = :receiverId AND m.messageCategory = :category AND m.isRead = false AND m.deletedAt IS NULL")
    long countByReceiverIdAndMessageCategoryAndIsReadFalse(
        @Param("receiverId") Long receiverId,
        @Param("category") MessageCategory category
    );
}

