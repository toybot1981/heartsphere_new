package com.heartsphere.mentis.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * MCP 服务器配置实体
 * 用于存储和管理外部 MCP 服务器的配置信息
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

    /**
     * 模板ID（如果从模板创建）
     */
    @Column
    private Long templateId;

    /**
     * 配置名称（用户友好的名称）
     */
    @Column(nullable = false, length = 200)
    private String name;

    /**
     * MCP 服务器类型（如：tavily, filesystem, github 等）
     */
    @Column(nullable = false, length = 100)
    private String serverType;

    /**
     * MCP 服务器 URL
     * 对于 HTTP 服务器，这是完整的 URL
     * 对于其他类型，可能是连接字符串
     */
    @Column(nullable = false, length = 1000)
    private String serverUrl;

    /**
     * API Key 或其他认证信息（加密存储）
     */
    @Column(length = 500)
    private String apiKey;

    /**
     * 是否启用
     */
    @Column(nullable = false)
    private Boolean enabled = true;

    /**
     * 配置描述
     */
    @Column(length = 1000)
    private String description;

    /**
     * 额外配置（JSON 格式）
     */
    @Column(columnDefinition = "TEXT")
    private String extraConfig;

    /**
     * 用户ID（如果配置是用户级别的）
     */
    @Column
    private Long userId;

    /**
     * 创建时间
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 最后连接测试时间
     */
    @Column
    private LocalDateTime lastTestedAt;

    /**
     * 连接状态（CONNECTED, DISCONNECTED, ERROR）
     */
    @Column(length = 50)
    private String connectionStatus = "DISCONNECTED";

    /**
     * 最后错误信息
     */
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
