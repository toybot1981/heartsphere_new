package com.heartsphere.admin.entity.agentmind;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 智能体身份认知实体
 * 存储智能体的身份认知信息，包括基本信息、能力列表和能力边界
 */
@Data
@Entity
@Table(name = "agent_identity", indexes = {
    @Index(name = "idx_character_id", columnList = "character_id")
})
public class AgentIdentity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 角色ID（关联到Character表）
     */
    @Column(name = "character_id", nullable = false, unique = true)
    private Long characterId;
    
    /**
     * 身份认知数据（JSON格式）
     * 包含：基本信息、自我描述、个性特征等
     */
    @Column(name = "identity_data", columnDefinition = "JSON")
    private String identityData;
    
    /**
     * 能力列表（JSON格式）
     * 包含：技能ID、技能名称、技能描述等
     */
    @Column(name = "capabilities", columnDefinition = "JSON")
    private String capabilities;
    
    /**
     * 能力边界（JSON格式）
     * 包含：不能做的事情、限制说明等
     */
    @Column(name = "limitations", columnDefinition = "JSON")
    private String limitations;
    
    /**
     * 自我认知水平（0-100）
     */
    @Column(name = "self_awareness_level")
    private Integer selfAwarenessLevel = 0;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
