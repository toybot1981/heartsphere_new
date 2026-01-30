package com.heartsphere.admin.entity.skill;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 技能资源实体（Admin模块）
 * 对应表：skill_resources
 * <p>
 * 与 skill-creator 规范对应：Bundled Resources（可选）— 单表通过 resource_type 区分：
 * SCRIPT（scripts/）、REFERENCE（references/）、ASSET（assets/），与 skill_definitions.skill_id 关联。
 *
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Entity
@Table(name = "skill_resources", indexes = {
    @Index(name = "idx_skill_id", columnList = "skill_id"),
    @Index(name = "idx_resource_type", columnList = "resource_type"),
    @Index(name = "idx_order_index", columnList = "order_index")
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
     * 资源类型：SCRIPT（脚本）/REFERENCE（参考文档）/ASSET（资产文件）
     */
    @Column(name = "resource_type", nullable = false, length = 50)
    private String resourceType;
    
    /**
     * 资源名称（原始名称，用于显示）
     */
    @Column(name = "resource_name", nullable = false, length = 255)
    private String resourceName;
    
    /**
     * 文件名（存储的文件名）
     */
    @Column(name = "file_name", length = 255)
    private String fileName;
    
    /**
     * 文件存储路径（相对路径）
     */
    @Column(name = "file_path", length = 500)
    private String filePath;
    
    /**
     * 文件大小（字节）
     */
    @Column(name = "file_size")
    private Long fileSize;
    
    /**
     * MIME类型
     */
    @Column(name = "mime_type", length = 100)
    private String mimeType;
    
    /**
     * 资源描述
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    /**
     * 排序索引
     */
    @Column(name = "order_index")
    private Integer orderIndex = 0;
    
    /**
     * 资源内容（文本内容，可选，用于存储小文件的内容）
     */
    @Column(name = "resource_content", columnDefinition = "TEXT")
    private String resourceContent;
    
    /**
     * 资源URL（兼容旧字段，如果使用 resource_url）
     */
    @Column(name = "resource_url", length = 500)
    private String resourceUrl;
    
    /**
     * 资源顺序（兼容旧字段，如果使用 resource_order）
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
     * 更新时间
     */
    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
