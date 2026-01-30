package com.heartsphere.shared.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 工具配置实体
 * 存储工具的配置信息，包括描述、提示词、指令等
 */
@Data
@Entity
@Table(name = "tool_configs", indexes = {
    @Index(name = "idx_tool_name", columnList = "tool_name"),
    @Index(name = "idx_category", columnList = "category"),
    @Index(name = "idx_is_active", columnList = "is_active")
})
public class ToolConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tool_name", nullable = false, unique = true, length = 100)
    private String toolName;  // 工具名称，与 Tool.getName() 对应

    @Column(length = 500)
    private String description;  // 工具描述（可编辑）

    @Column(length = 50)
    private String category;  // 工具分类（browser、terminal、filesystem、code、system）

    @Column(name = "prompt_template_category", length = 100)
    private String promptTemplateCategory;  // 提示词模板的分类代码（关联 PromptTemplate）

    @Column(name = "instruction_template", columnDefinition = "TEXT")
    private String instructionTemplate;  // 指令模板（JSON 格式）

    @Column(name = "script_template", columnDefinition = "TEXT")
    private String scriptTemplate;  // 脚本模板（对于需要脚本的工具，如 Python）

    @Column(name = "parameters_schema", columnDefinition = "JSON")
    private String parametersSchema;  // 参数模式（JSON Schema 格式，可编辑）

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
