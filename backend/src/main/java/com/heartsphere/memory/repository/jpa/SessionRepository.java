package com.heartsphere.memory.repository.jpa;

import com.heartsphere.memory.entity.SessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 会话Repository（JPA）
 * 
 * @author HeartSphere
 * @date 2025-12-31
 */
@Repository
public interface SessionRepository extends JpaRepository<SessionEntity, Long> {
    
    /**
     * 根据会话ID查找
     */
    Optional<SessionEntity> findBySessionId(String sessionId);
    
    /**
     * 根据用户ID获取所有会话
     */
    List<SessionEntity> findByUserIdOrderByUpdatedAtDesc(String userId);
    
    /**
     * 根据用户ID统计会话数量
     */
    long countByUserId(String userId);
    
    /**
     * 删除过期会话
     */
    @Modifying
    @Query("DELETE FROM SessionEntity s WHERE s.expiresAt < :now")
    void deleteExpiredSessions(@Param("now") LocalDateTime now);
    
    /**
     * 根据会话ID删除
     */
    @Modifying
    @Query("DELETE FROM SessionEntity s WHERE s.sessionId = :sessionId")
    void deleteBySessionId(@Param("sessionId") String sessionId);
}


