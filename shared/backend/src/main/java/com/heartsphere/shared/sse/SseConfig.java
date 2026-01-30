package com.heartsphere.shared.sse;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * SSE配置类
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Configuration
@ConfigurationProperties(prefix = "sse")
@Data
public class SseConfig {
    
    /**
     * 默认超时时间（毫秒）
     */
    private long defaultTimeout = 300000L; // 5分钟
    
    /**
     * 最大重连次数
     */
    private int maxReconnectAttempts = 5;
    
    /**
     * 重连间隔（毫秒）
     */
    private long reconnectInterval = 3000L; // 3秒
    
    /**
     * 是否启用自动重连
     */
    private boolean autoReconnect = true;
}
