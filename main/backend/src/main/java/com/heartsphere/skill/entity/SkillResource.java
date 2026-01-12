package com.heartsphere.skill.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 技能资源实体
 * 对应 Claude Skill 的 Level 3：资源和代码
 * 
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Entity
@Table(name = "skill_resources", indexes = {
    @Index(name = "idx_skill_id", columnList = "skill_id"),
    @Index(name = "idx_resource_type", columnList = "resource_type")
})
public class SkillResource {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 关联的技能ID
     */
    @Column(name = "skill_id", nullable = false, length = 100)
    private String skillId;
    
    /**
     * 资源类型：template/example/script/config
     */
    @Column(name = "resource_type", nullable = false, length = 50)
    private String resourceType;
    
    /**
     * 资源名称
     */
    @Column(name = "resource_name", nullable = false, length = 255)
    private String resourceName;
    
    /**
     * 资源内容（文本）
     */
    @Column(name = "resource_content", columnDefinition = "TEXT")
    private String resourceContent;
    
    /**
     * 资源URL（文件）
     */
    @Column(name = "resource_url", length = 500)
    private String resourceUrl;
    
    /**
     * 资源顺序
     */
    @Column(name = "resource_order")
    private Integer resourceOrder = 0;
    
    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    /**
     * 外键关联到技能定义（数据库层面）
     * 注意：这里不建立 JPA 关系，保持模块独立
     */
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "skill_id", insertable = false, updatable = false)
    // private SkillDefinition skillDefinition;
}
