package com.heartsphere.memory.model.participant;

import com.heartsphere.memory.model.PreferenceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.time.Instant;

/**
 * 参与者偏好
 * 存储参与者的交互偏好、行为模式、兴趣偏好等
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantPreference {
    
    @Id
    private String id;
    
    /**
     * 参与者ID
     */
    private String participantId;
    
    /**
     * 场景ID（可选）
     */
    private String sceneId;
    
    /**
     * 偏好键
     */
    private String key;
    
    /**
     * 偏好值
     */
    private Object value;
    
    /**
     * 值类型
     */
    private PreferenceType type;
    
    /**
     * 置信度
     */
    private Double confidence;
    
    /**
     * 更新时间
     */
    private Instant updatedAt;
    
    /**
     * 访问次数
     */
    private Integer accessCount;
}



