package com.heartsphere.ai.mcp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * MCP 服务模板实体（main 项目 ai/mcp 基础设施）
 */
@Entity
@Table(name = "mcp_service_templates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class McpServiceTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 200)
    private String templateName;

    @Column(nullable = false, length = 100)
    private String serverType;

    @Column(length = 50)
    private String category;

    @Column(length = 1000)
    private String defaultUrl;

    @Column(length = 1000)
    private String defaultUrlTemplate;

    @Column(columnDefinition = "TEXT")
    private String requiredParams;

    @Column(columnDefinition = "TEXT")
    private String optionalParams;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String setupInstructions;

    @Column(length = 500)
    private String iconUrl;

    @Column(nullable = false)
    private Boolean isPopular = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
