package com.heartsphere.skill.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 技能冲突实体
 * 定义不能同时装备的技能
 * 
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Entity
@Table(name = "skill_conflicts",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_skill_conflict", columnNames = {"skill_id_1", "skill_id_2"})
    },
    indexes = {
        @Index(name = "idx_skill_id_1", columnList = "skill_id_1"),
        @Index(name = "idx_skill_id_2", columnList = "skill_id_2")
    }
)
public class SkillConflict {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 技能1 ID
     */
    @Column(name = "skill_id_1", nullable = false, length = 100)
    private String skillId1;
    
    /**
     * 技能2 ID
     */
    @Column(name = "skill_id_2", nullable = false, length = 100)
    private String skillId2;
    
    /**
     * 冲突类型：MUTUAL_EXCLUSIVE（互斥）/WEAK_CONFLICT（弱冲突）
     */
    @Column(name = "conflict_type", length = 50)
    private String conflictType = "MUTUAL_EXCLUSIVE";
    
    /**
     * 冲突原因说明
     */
    @Column(name = "conflict_reason", columnDefinition = "TEXT")
    private String conflictReason;
    
    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    /**
     * 检查两个技能是否冲突
     */
    public boolean isConflict(String skillId1, String skillId2) {
        return (this.skillId1.equals(skillId1) && this.skillId2.equals(skillId2)) ||
               (this.skillId1.equals(skillId2) && this.skillId2.equals(skillId1));
    }
}
