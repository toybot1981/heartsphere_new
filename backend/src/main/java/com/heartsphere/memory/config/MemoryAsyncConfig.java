package com.heartsphere.memory.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * 记忆系统异步处理配置
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Configuration
@EnableAsync
public class MemoryAsyncConfig {
    
    /**
     * 记忆提取线程池
     */
    @Bean(name = "memoryExtractionExecutor")
    public Executor memoryExtractionExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);           // 核心线程数
        executor.setMaxPoolSize(10);          // 最大线程数
        executor.setQueueCapacity(100);        // 队列容量
        executor.setThreadNamePrefix("memory-extraction-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }
}




