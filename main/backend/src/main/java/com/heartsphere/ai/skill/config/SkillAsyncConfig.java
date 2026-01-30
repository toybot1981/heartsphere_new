package com.heartsphere.ai.skill.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * 技能异步处理配置
 * 配置异步执行记录写入的线程池
 */
@Configuration
@EnableAsync
@Slf4j
public class SkillAsyncConfig {

    /**
     * 技能执行记录异步写入线程池
     */
    @Bean(name = "skillRecordExecutor")
    public Executor skillRecordExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // 核心线程数
        executor.setCorePoolSize(2);
        
        // 最大线程数
        executor.setMaxPoolSize(5);
        
        // 队列容量
        executor.setQueueCapacity(100);
        
        // 线程名前缀
        executor.setThreadNamePrefix("skill-record-");
        
        // 拒绝策略：调用者运行（确保任务不会丢失）
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        
        // 等待所有任务结束后再关闭线程池
        executor.setWaitForTasksToCompleteOnShutdown(true);
        
        // 等待时间（秒）
        executor.setAwaitTerminationSeconds(60);
        
        executor.initialize();
        
        log.info("技能执行记录异步线程池初始化完成: corePoolSize=2, maxPoolSize=5, queueCapacity=100");
        
        return executor;
    }
}
