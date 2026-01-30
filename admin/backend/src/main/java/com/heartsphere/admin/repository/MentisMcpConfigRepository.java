package com.heartsphere.admin.repository;

import com.heartsphere.admin.config.DataSourceContextHolder;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * MCP 配置 Repository（admin 端）
 * 访问 main 数据源（heartsphere 数据库）中的 mcp_server_configs 表
 * 注意：MCP 功能已从 mentis 迁移至 main，表在 main 库
 */
@Repository
public class MentisMcpConfigRepository {
    
    private final JdbcTemplate jdbcTemplate;
    
    public MentisMcpConfigRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    
    /**
     * 切换到 Main 数据源（MCP 表在 main 库，即 heartsphere 数据库，与 admin 默认数据源相同）
     * 使用默认数据源（admin），因为 main 和 admin 共用 heartsphere 数据库
     */
    private void switchToMainDataSource() {
        // 使用默认数据源（admin），即 heartsphere 数据库，MCP 表在此库中
        DataSourceContextHolder.clearDataSourceKey(); // 默认数据源即为 main 库
    }
    
    /**
     * 恢复默认数据源
     */
    private void restoreDefaultDataSource() {
        DataSourceContextHolder.clearDataSourceKey();
    }
    
    /**
     * 查找所有 MCP 配置
     */
    public List<MentisMcpConfigEntity> findAll() {
        try {
            switchToMainDataSource();
            return jdbcTemplate.query(
                "SELECT * FROM mcp_server_configs ORDER BY created_at DESC",
                new MentisMcpConfigRowMapper()
            );
        } finally {
            restoreDefaultDataSource();
        }
    }
    
    /**
     * 根据 ID 查找
     */
    public Optional<MentisMcpConfigEntity> findById(Long id) {
        try {
            switchToMainDataSource();
            List<MentisMcpConfigEntity> results = jdbcTemplate.query(
                "SELECT * FROM mcp_server_configs WHERE id = ?",
                new MentisMcpConfigRowMapper(),
                id
            );
            return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
        } finally {
            restoreDefaultDataSource();
        }
    }
    
    /**
     * 保存 MCP 配置
     */
    public MentisMcpConfigEntity save(MentisMcpConfigEntity entity) {
        try {
            switchToMainDataSource();
            if (entity.getId() == null) {
                // Insert（包含 template_id 字段，main 表有此字段）
                jdbcTemplate.update(
                    "INSERT INTO mcp_server_configs (template_id, name, server_type, server_url, api_key, enabled, description, extra_config, user_id, created_at, updated_at, connection_status) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    entity.getTemplateId(),
                    entity.getName(),
                    entity.getServerType(),
                    entity.getServerUrl(),
                    entity.getApiKey(),
                    entity.getEnabled(),
                    entity.getDescription(),
                    entity.getExtraConfig(),
                    entity.getUserId(),
                    LocalDateTime.now(),
                    LocalDateTime.now(),
                    entity.getConnectionStatus() != null ? entity.getConnectionStatus() : "DISCONNECTED"
                );
                // 获取生成的 ID
                Long id = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
                entity.setId(id);
            } else {
                // Update（包含 template_id 字段）
                jdbcTemplate.update(
                    "UPDATE mcp_server_configs SET template_id = ?, name = ?, server_type = ?, server_url = ?, api_key = ?, enabled = ?, description = ?, extra_config = ?, user_id = ?, updated_at = ?, connection_status = ?, last_tested_at = ?, last_error = ? WHERE id = ?",
                    entity.getTemplateId(),
                    entity.getName(),
                    entity.getServerType(),
                    entity.getServerUrl(),
                    entity.getApiKey(),
                    entity.getEnabled(),
                    entity.getDescription(),
                    entity.getExtraConfig(),
                    entity.getUserId(),
                    LocalDateTime.now(),
                    entity.getConnectionStatus(),
                    entity.getLastTestedAt(),
                    entity.getLastError(),
                    entity.getId()
                );
            }
            return entity;
        } finally {
            restoreDefaultDataSource();
        }
    }
    
    /**
     * 删除 MCP 配置
     */
    public void deleteById(Long id) {
        try {
            switchToMainDataSource();
            jdbcTemplate.update("DELETE FROM mcp_server_configs WHERE id = ?", id);
        } finally {
            restoreDefaultDataSource();
        }
    }
    
    /**
     * MCP 配置实体（内部使用）
     * 对应 main 库 mcp_server_configs 表
     */
    public static class MentisMcpConfigEntity {
        private Long id;
        private Long templateId; // 模板ID（main 表有此字段）
        private String name;
        private String serverType;
        private String serverUrl;
        private String apiKey;
        private Boolean enabled;
        private String description;
        private String extraConfig;
        private Long userId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime lastTestedAt;
        private String connectionStatus;
        private String lastError;
        
        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getTemplateId() { return templateId; }
        public void setTemplateId(Long templateId) { this.templateId = templateId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getServerType() { return serverType; }
        public void setServerType(String serverType) { this.serverType = serverType; }
        public String getServerUrl() { return serverUrl; }
        public void setServerUrl(String serverUrl) { this.serverUrl = serverUrl; }
        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
        public Boolean getEnabled() { return enabled; }
        public void setEnabled(Boolean enabled) { this.enabled = enabled; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getExtraConfig() { return extraConfig; }
        public void setExtraConfig(String extraConfig) { this.extraConfig = extraConfig; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
        public LocalDateTime getLastTestedAt() { return lastTestedAt; }
        public void setLastTestedAt(LocalDateTime lastTestedAt) { this.lastTestedAt = lastTestedAt; }
        public String getConnectionStatus() { return connectionStatus; }
        public void setConnectionStatus(String connectionStatus) { this.connectionStatus = connectionStatus; }
        public String getLastError() { return lastError; }
        public void setLastError(String lastError) { this.lastError = lastError; }
    }
    
    /**
     * Row Mapper
     */
    private static class MentisMcpConfigRowMapper implements RowMapper<MentisMcpConfigEntity> {
        @Override
        public MentisMcpConfigEntity mapRow(ResultSet rs, int rowNum) throws SQLException {
            MentisMcpConfigEntity entity = new MentisMcpConfigEntity();
            entity.setId(rs.getLong("id"));
            Long templateId = rs.getLong("template_id");
            if (!rs.wasNull()) {
                entity.setTemplateId(templateId);
            }
            entity.setName(rs.getString("name"));
            entity.setServerType(rs.getString("server_type"));
            entity.setServerUrl(rs.getString("server_url"));
            entity.setApiKey(rs.getString("api_key"));
            entity.setEnabled(rs.getBoolean("enabled"));
            entity.setDescription(rs.getString("description"));
            entity.setExtraConfig(rs.getString("extra_config"));
            Long userId = rs.getLong("user_id");
            if (!rs.wasNull()) {
                entity.setUserId(userId);
            }
            entity.setCreatedAt(rs.getTimestamp("created_at") != null ? 
                rs.getTimestamp("created_at").toLocalDateTime() : null);
            entity.setUpdatedAt(rs.getTimestamp("updated_at") != null ? 
                rs.getTimestamp("updated_at").toLocalDateTime() : null);
            entity.setLastTestedAt(rs.getTimestamp("last_tested_at") != null ? 
                rs.getTimestamp("last_tested_at").toLocalDateTime() : null);
            entity.setConnectionStatus(rs.getString("connection_status"));
            entity.setLastError(rs.getString("last_error"));
            return entity;
        }
    }
}
