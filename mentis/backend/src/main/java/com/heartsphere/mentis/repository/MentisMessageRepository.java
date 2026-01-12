package com.heartsphere.mentis.repository;

import com.heartsphere.mentis.entity.MentisMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentisMessageRepository extends JpaRepository<MentisMessage, Long> {

    /**
     * 根据消息ID查找
     */
    Optional<MentisMessage> findByMessageId(String messageId);

    /**
     * 根据会话ID查找所有消息（按时间排序）
     */
    List<MentisMessage> findBySession_IdOrderByCreatedAtAsc(Long sessionId);

    /**
     * 根据会话ID和角色查找消息
     */
    List<MentisMessage> findBySession_IdAndRoleOrderByCreatedAtAsc(Long sessionId, String role);

    /**
     * 查找最近N条消息
     */
    @Query("SELECT m FROM MentisMessage m WHERE m.session.id = :sessionId ORDER BY m.createdAt DESC")
    List<MentisMessage> findRecentMessagesBySessionId(@Param("sessionId") Long sessionId, org.springframework.data.domain.Pageable pageable);

    /**
     * 根据任务ID查找相关消息
     */
    List<MentisMessage> findByTaskIdOrderByCreatedAtAsc(String taskId);
}
