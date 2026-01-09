package com.heartsphere.mentis.repository;

import com.heartsphere.mentis.entity.MentisSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentisSessionRepository extends JpaRepository<MentisSession, Long> {

    /**
     * 根据会话ID查找
     */
    Optional<MentisSession> findBySessionId(String sessionId);

    /**
     * 根据用户ID查找所有会话
     */
    List<MentisSession> findByUserIdOrderByLastActiveAtDesc(Long userId);

    /**
     * 根据用户ID和状态查找会话
     */
    List<MentisSession> findByUserIdAndStatusOrderByLastActiveAtDesc(Long userId, String status);

    /**
     * 查找活跃的会话
     */
    @Query("SELECT s FROM MentisSession s WHERE s.userId = :userId AND s.status = 'ACTIVE' ORDER BY s.lastActiveAt DESC")
    List<MentisSession> findActiveSessionsByUserId(@Param("userId") Long userId);

    /**
     * 查找需要清理的旧会话（30天未活跃且状态为COMPLETED或ARCHIVED）
     */
    @Query("SELECT s FROM MentisSession s WHERE s.status IN ('COMPLETED', 'ARCHIVED') AND s.lastActiveAt < :cutoffDate")
    List<MentisSession> findOldSessionsForCleanup(@Param("cutoffDate") java.time.LocalDateTime cutoffDate);
}
