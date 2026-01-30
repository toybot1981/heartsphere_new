package com.heartsphere.admin.service;

import com.heartsphere.admin.entity.ScheduledTask;
import com.heartsphere.admin.repository.ScheduledTaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
// 注意：Spring 5.3+ 支持 CronExpression，如果版本较低可以使用 cron-utils
// import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

/**
 * 定时任务调度器
 * 使用 Spring TaskScheduler 动态调度任务
 */
@Component
public class ScheduledTaskScheduler {
    
    private static final Logger logger = LoggerFactory.getLogger(ScheduledTaskScheduler.class);
    
    @Autowired
    private ScheduledTaskRepository scheduledTaskRepository;
    
    @Autowired
    @org.springframework.context.annotation.Lazy
    private ScheduledTaskService scheduledTaskService;
    
    @Autowired
    private ThreadPoolTaskScheduler taskScheduler;
    
    // 存储已调度的任务
    private final ConcurrentHashMap<Long, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();
    
    @PostConstruct
    public void init() {
        try {
            // 启动时加载所有启用的定时任务
            List<ScheduledTask> tasks = scheduledTaskRepository.findByEnabledTrue();
            for (ScheduledTask task : tasks) {
                scheduleTask(task);
            }
            logger.info("Loaded {} scheduled tasks", tasks.size());
        } catch (Exception e) {
            // 如果表不存在或其他错误，记录警告但不阻止启动
            logger.warn("Failed to load scheduled tasks during initialization: {}", e.getMessage());
            logger.info("This is normal if the database tables have not been created yet", e);
        }
    }
    
    /**
     * 每分钟检查一次需要执行的任务
     */
    @Scheduled(fixedRate = 60000) // 每分钟
    public void checkAndExecuteTasks() {
        try {
            LocalDateTime now = LocalDateTime.now();
            List<ScheduledTask> tasksToExecute = scheduledTaskRepository.findTasksToExecute(now);
            
            for (ScheduledTask task : tasksToExecute) {
                if (task.getEnabled() && task.getNextExecutionTime() != null 
                    && task.getNextExecutionTime().isBefore(now) || task.getNextExecutionTime().isEqual(now)) {
                    logger.info("Executing scheduled task: {}", task.getName());
                    scheduledTaskService.executeTask(task);
                }
            }
        } catch (Exception e) {
            logger.error("Error checking scheduled tasks", e);
        }
    }
    
    /**
     * 调度任务
     */
    public void scheduleTask(ScheduledTask task) {
        if (!task.getEnabled()) {
            return;
        }
        
        // 取消旧任务（如果存在）
        unscheduleTask(task.getId());
        
        try {
            // 解析 Cron 表达式（Spring 5.3+）
            // 如果版本较低，可以使用 cron-utils 库
            LocalDateTime nextExecution;
            try {
                org.springframework.scheduling.support.CronExpression cronExpression = 
                    org.springframework.scheduling.support.CronExpression.parse(task.getCronExpression());
                nextExecution = cronExpression.next(LocalDateTime.now());
            } catch (Exception e) {
                // 如果解析失败，使用简单计算（每分钟检查一次）
                logger.warn("Failed to parse cron expression, using simple calculation: {}", task.getCronExpression());
                nextExecution = LocalDateTime.now().plusMinutes(1);
            }
            
            if (nextExecution == null) {
                logger.warn("Cannot calculate next execution time for task: {}", task.getId());
                return;
            }
            
            // 更新下次执行时间
            task.setNextExecutionTime(nextExecution);
            scheduledTaskRepository.save(task);
            
            // 计算延迟时间（毫秒）
            long delay = java.time.Duration.between(LocalDateTime.now(), nextExecution).toMillis();
            
            if (delay > 0) {
                // 调度一次性任务
                ScheduledFuture<?> future = taskScheduler.schedule(
                    () -> {
                        try {
                            scheduledTaskService.executeTask(task);
                            // 执行后重新调度
                            scheduleTask(task);
                        } catch (Exception e) {
                            logger.error("Error executing scheduled task: " + task.getId(), e);
                        }
                    },
                    Date.from(nextExecution.atZone(ZoneId.systemDefault()).toInstant())
                );
                
                scheduledTasks.put(task.getId(), future);
                logger.info("Scheduled task: {} (next execution: {})", task.getName(), nextExecution);
            }
        } catch (Exception e) {
            logger.error("Failed to schedule task: " + task.getId(), e);
        }
    }
    
    /**
     * 取消任务调度
     */
    public void unscheduleTask(Long taskId) {
        ScheduledFuture<?> future = scheduledTasks.remove(taskId);
        if (future != null) {
            future.cancel(false);
            logger.info("Unscheduled task: {}", taskId);
        }
    }
}
