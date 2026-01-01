package com.heartsphere.memory.repository.jpa;

import com.heartsphere.memory.entity.ChatMessageEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 对话消息Repository（JPA）
 * 
 * @author HeartSphere
 * @date 2025-12-31
 */
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, String> {
    
    /**
     * 根据会话ID获取消息（按时间倒序）
     */
    List<ChatMessageEntity> findBySessionIdOrderByTimestampDesc(String sessionId, Pageable pageable);
    
    /**
     * 根据会话ID和时间范围获取消息
     */
    @Query("SELECT m FROM ChatMessageEntity m WHERE m.sessionId = :sessionId " +
           "AND m.timestamp >= :startTime AND m.timestamp <= :endTime " +
           "ORDER BY m.timestamp ASC")
    List<ChatMessageEntity> findBySessionIdAndTimestampBetween(
        @Param("sessionId") String sessionId,
        @Param("startTime") Long startTime,
        @Param("endTime") Long endTime
    );
    
    /**
     * 根据会话ID删除所有消息
     */
    @Modifying
    @Query("DELETE FROM ChatMessageEntity m WHERE m.sessionId = :sessionId")
    void deleteBySessionId(@Param("sessionId") String sessionId);
    
    /**
     * 根据会话ID统计消息数量
     */
    long countBySessionId(String sessionId);
    
    /**
     * 根据用户ID获取所有会话ID（去重）
     */
    @Query("SELECT DISTINCT m.sessionId FROM ChatMessageEntity m WHERE m.userId = :userId")
    List<String> findDistinctSessionIdsByUserId(@Param("userId") String userId);
    
    /**
     * 根据用户ID统计会话数量
     */
    @Query("SELECT COUNT(DISTINCT m.sessionId) FROM ChatMessageEntity m WHERE m.userId = :userId")
    long countDistinctSessionsByUserId(@Param("userId") String userId);
    
    /**
     * 删除过期消息
     */
    @Modifying
    @Query("DELETE FROM ChatMessageEntity m WHERE m.expiresAt < :now")
    void deleteExpiredMessages(@Param("now") LocalDateTime now);
    
    /**
     * 根据会话ID删除指定消息
     */
    @Modifying
    @Query("DELETE FROM ChatMessageEntity m WHERE m.sessionId = :sessionId AND m.id = :messageId")
    void deleteBySessionIdAndId(@Param("sessionId") String sessionId, @Param("messageId") String messageId);
}


