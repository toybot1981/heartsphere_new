package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 提示词模板变量实体
 */
@Data
@Entity
@Table(name = "prompt_variables")
public class PromptVariable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "template_id", nullable = false)
    private Long templateId;

    @Column(name = "variable_name", nullable = false, length = 100)
    private String variableName;

    @Column(name = "variable_type", nullable = false, length = 50)
    private String variableType; // string, number, boolean, array, object

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "default_value", columnDefinition = "TEXT")
    private String defaultValue;

    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = false;

    @Column(name = "validation_rule", columnDefinition = "JSON")
    private String validationRule; // JSON格式的验证规则

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
