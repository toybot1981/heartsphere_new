package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.ScheduledTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 定时任务 Repository
 */
@Repository
public interface ScheduledTaskRepository extends JpaRepository<ScheduledTask, Long> {
    
    /**
     * 查询所有启用的定时任务
     */
    List<ScheduledTask> findByEnabledTrue();
    
    /**
     * 根据脚本ID查询定时任务
     */
    List<ScheduledTask> findByScriptId(String scriptId);
    
    /**
     * 查询需要执行的任务（下次执行时间已到且启用）
     */
    @Query("SELECT st FROM ScheduledTask st WHERE st.enabled = true AND st.nextExecutionTime <= :now")
    List<ScheduledTask> findTasksToExecute(@Param("now") LocalDateTime now);
}
