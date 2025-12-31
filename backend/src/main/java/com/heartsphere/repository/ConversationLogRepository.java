package com.heartsphere.repository;

import com.heartsphere.entity.ConversationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 对话日志Repository
 */
@Repository
public interface ConversationLogRepository extends JpaRepository<ConversationLog, Long> {
    
    /**
     * 根据用户ID查找未删除的对话日志
     */
    List<ConversationLog> findByUserIdAndIsDeletedFalseOrderByLastMessageAtDesc(Long userId);
    
    /**
     * 根据用户ID查找已删除的对话日志（回收站）
     */
    List<ConversationLog> findByUserIdAndIsDeletedTrueOrderByDeletedAtDesc(Long userId);
    
    /**
     * 根据会话ID查找对话日志
     */
    Optional<ConversationLog> findBySessionId(String sessionId);
    
    /**
     * 根据用户ID和角色ID查找未删除的对话日志
     */
    List<ConversationLog> findByUserIdAndCharacterIdAndIsDeletedFalseOrderByLastMessageAtDesc(
        Long userId, Long characterId
    );
    
    /**
     * 根据用户ID和角色ID查找对话日志（包括已删除的）
     */
    @Query("SELECT cl FROM ConversationLog cl WHERE cl.userId = :userId AND cl.characterId = :characterId ORDER BY cl.lastMessageAt DESC")
    List<ConversationLog> findByUserIdAndCharacterId(@Param("userId") Long userId, @Param("characterId") Long characterId);
}

