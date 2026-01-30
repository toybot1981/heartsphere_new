package com.heartsphere.ai.mcp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * MCP 服务器配置实体（main 项目 ai/mcp 基础设施）
 */
@Entity
@Table(name = "mcp_server_configs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class McpServerConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "template_id")
    private Long templateId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 100)
    private String serverType;

    @Column(nullable = false, length = 1000)
    private String serverUrl;

    @Column(length = 500)
    private String apiKey;

    @Column(nullable = false)
    private Boolean enabled = true;

    @Column(length = 1000)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String extraConfig;

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column
    private LocalDateTime lastTestedAt;

    @Column(length = 50)
    private String connectionStatus = "DISCONNECTED";

    @Column(columnDefinition = "TEXT")
    private String lastError;

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
