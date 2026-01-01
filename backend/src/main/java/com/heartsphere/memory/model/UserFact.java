package com.heartsphere.memory.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * 用户事实模型
 * 用于长期记忆存储
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFact {
    @Id
    private String id;
    
    /**
     * 用户ID
     */
    private String userId;
    
    /**
     * 事实描述
     */
    private String fact;
    
    /**
     * 事实类别
     */
    private FactCategory category;
    
    /**
     * 重要性 (0.0-1.0)
     */
    private Double importance;
    
    /**
     * 置信度 (0.0-1.0)
     */
    private Double confidence;
    
    /**
     * 来源会话ID
     */
    private String sourceSessionId;
    
    /**
     * 创建时间
     */
    private Instant createdAt;
    
    /**
     * 最后访问时间
     */
    private Instant lastAccessedAt;
    
    /**
     * 访问次数
     */
    private Integer accessCount;
    
    /**
     * 标签
     */
    private List<String> tags;
    
    /**
     * 扩展元数据
     */
    private Map<String, Object> metadata;
    
    /**
     * 计算衰减后的重要性
     * 
     * @return 衰减后的重要性
     */
    public double getDecayedImportance() {
        if (lastAccessedAt == null) {
            return importance != null ? importance : 0.0;
        }
        
        // 时间衰减（7天衰减一半）
        long daysSinceLastAccess = Duration.between(lastAccessedAt, Instant.now()).toDays();
        double timeDecay = Math.exp(-daysSinceLastAccess / 7.0);
        
        // 访问频率加成
        double accessBonus = Math.log(1 + (accessCount == null ? 0 : accessCount)) / 10.0;
        
        double baseImportance = importance != null ? importance : 0.0;
        return baseImportance * timeDecay + accessBonus;
    }
    
    /**
     * 记录访问
     */
    public void recordAccess() {
        this.lastAccessedAt = Instant.now();
        this.accessCount = (this.accessCount == null ? 0 : this.accessCount) + 1;
    }
}




