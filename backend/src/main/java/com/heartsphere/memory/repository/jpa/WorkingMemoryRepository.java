package com.heartsphere.memory.repository.jpa;

import com.heartsphere.memory.entity.WorkingMemoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 工作记忆Repository（JPA）
 * 
 * @author HeartSphere
 * @date 2025-12-31
 */
@Repository
public interface WorkingMemoryRepository extends JpaRepository<WorkingMemoryEntity, Long> {
    
    /**
     * 根据会话ID和键获取工作记忆
     */
    Optional<WorkingMemoryEntity> findBySessionIdAndMemoryKey(String sessionId, String memoryKey);
    
    /**
     * 根据会话ID删除所有工作记忆
     */
    @Modifying
    @Query("DELETE FROM WorkingMemoryEntity w WHERE w.sessionId = :sessionId")
    void deleteBySessionId(@Param("sessionId") String sessionId);
    
    /**
     * 删除过期的工作记忆
     */
    @Modifying
    @Query("DELETE FROM WorkingMemoryEntity w WHERE w.expiresAt < :now")
    void deleteExpired(@Param("now") LocalDateTime now);
}

