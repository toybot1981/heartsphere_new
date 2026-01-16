package com.heartsphere.mentis.repository;

import com.heartsphere.mentis.entity.MentisTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentisTaskRepository extends JpaRepository<MentisTask, Long> {

    /**
     * 根据任务ID查找
     */
    Optional<MentisTask> findByTaskId(String taskId);

    /**
     * 根据会话ID查找所有任务
     */
    List<MentisTask> findBySession_IdOrderByCreatedAtDesc(Long sessionId);

    /**
     * 根据会话ID和状态查找任务
     */
    List<MentisTask> findBySession_IdAndStatusOrderByCreatedAtDesc(Long sessionId, String status);

    /**
     * 查找运行中的任务
     */
    @Query("SELECT t FROM MentisTask t WHERE t.session.id = :sessionId AND t.status = 'RUNNING'")
    List<MentisTask> findRunningTasksBySessionId(@Param("sessionId") Long sessionId);

    /**
     * 根据任务类型查找
     */
    List<MentisTask> findByTaskTypeAndStatusOrderByCreatedAtDesc(String taskType, String status);
    
    /**
     * 根据会话ID和执行ID查找任务
     */
    List<MentisTask> findBySession_IdAndExecutionIdOrderByCreatedAtAsc(Long sessionId, String executionId);
    
    /**
     * 查找会话中最新任务的执行ID
     */
    @Query("SELECT t.executionId FROM MentisTask t WHERE t.session.id = :sessionId AND t.executionId IS NOT NULL ORDER BY t.createdAt DESC")
    List<String> findLatestExecutionIdsBySessionId(@Param("sessionId") Long sessionId);
    
    /**
     * 根据消息ID查找任务，按创建时间正序排列
     */
    List<MentisTask> findByMessageIdOrderByCreatedAtAsc(String messageId);
    
    /**
     * 查找会话中最新用户消息的 messageId
     */
    @Query("SELECT m.messageId FROM MentisMessage m WHERE m.session.id = :sessionId AND m.role = 'USER' ORDER BY m.createdAt DESC LIMIT 1")
    Optional<String> findLatestUserMessageIdBySessionId(@Param("sessionId") Long sessionId);
}
