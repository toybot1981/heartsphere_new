package com.heartsphere.admin.repository;

import com.heartsphere.admin.config.DataSourceContextHolder;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Mentis Agent 配置 Repository
 * 直接访问 Mentis 数据库
 */
@Repository
public class MentisAgentConfigRepository {
    
    private final JdbcTemplate jdbcTemplate;
    
    public MentisAgentConfigRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    
    /**
     * 切换到 Mentis 数据源
     */
    private void switchToMentisDataSource() {
        DataSourceContextHolder.setDataSourceKey("mentis");
    }
    
    /**
     * 恢复默认数据源
     */
    private void restoreDefaultDataSource() {
        DataSourceContextHolder.clearDataSourceKey();
    }
    
    /**
     * 查找所有配置
     */
    public List<MentisAgentConfigEntity> findAll() {
        try {
            switchToMentisDataSource();
            return jdbcTemplate.query(
                "SELECT * FROM mentis_agent_configs ORDER BY created_at DESC",
                new MentisAgentConfigRowMapper()
            );
        } finally {
            restoreDefaultDataSource();
        }
    }
    
    /**
     * 根据 ID 查找
     */
    public Optional<MentisAgentConfigEntity> findById(Long id) {
        try {
            switchToMentisDataSource();
            List<MentisAgentConfigEntity> results = jdbcTemplate.query(
                "SELECT * FROM mentis_agent_configs WHERE id = ?",
                new MentisAgentConfigRowMapper(),
                id
            );
            return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
        } finally {
            restoreDefaultDataSource();
        }
    }
    
    /**
     * 根据 agentId 查找
     */
    public Optional<MentisAgentConfigEntity> findByAgentId(Long agentId) {
        try {
            switchToMentisDataSource();
            List<MentisAgentConfigEntity> results = jdbcTemplate.query(
                "SELECT * FROM mentis_agent_configs WHERE agent_id = ?",
                new MentisAgentConfigRowMapper(),
                agentId
            );
            return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
        } finally {
            restoreDefaultDataSource();
        }
    }
    
    /**
     * 保存配置
     */
    public MentisAgentConfigEntity save(MentisAgentConfigEntity entity) {
        try {
            switchToMentisDataSource();
            if (entity.getId() == null) {
                // Insert
                String configJson = entity.getConfiguration() != null ? 
                    convertMapToJson(entity.getConfiguration()) : null;
                jdbcTemplate.update(
                    "INSERT INTO mentis_agent_configs (agent_id, agent_name, configuration, enabled, created_at, updated_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?)",
                    entity.getAgentId(),
                    entity.getAgentName(),
                    configJson,
                    entity.getEnabled(),
                    LocalDateTime.now(),
                    LocalDateTime.now()
                );
                // 获取生成的 ID
                Long id = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
                entity.setId(id);
            } else {
                // Update
                String configJson = entity.getConfiguration() != null ? 
                    convertMapToJson(entity.getConfiguration()) : null;
                jdbcTemplate.update(
                    "UPDATE mentis_agent_configs SET agent_id = ?, agent_name = ?, configuration = ?, enabled = ?, updated_at = ? WHERE id = ?",
                    entity.getAgentId(),
                    entity.getAgentName(),
                    configJson,
                    entity.getEnabled(),
                    LocalDateTime.now(),
                    entity.getId()
                );
            }
            return entity;
        } finally {
            restoreDefaultDataSource();
        }
    }
    
    /**
     * 删除配置
     */
    public void deleteById(Long id) {
        try {
            switchToMentisDataSource();
            jdbcTemplate.update("DELETE FROM mentis_agent_configs WHERE id = ?", id);
        } finally {
            restoreDefaultDataSource();
        }
    }
    
    private String convertMapToJson(Map<String, Object> map) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.writeValueAsString(map);
        } catch (Exception e) {
            return "{}";
        }
    }
    
    private Map<String, Object> convertJsonToMap(String json) {
        try {
            if (json == null || json.trim().isEmpty()) {
                return new HashMap<>();
            }
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.readValue(json, Map.class);
        } catch (Exception e) {
            return new HashMap<>();
        }
    }
    
    /**
     * Mentis Agent 配置实体（内部使用）
     */
    public static class MentisAgentConfigEntity {
        private Long id;
        private Long agentId;
        private String agentName;
        private Map<String, Object> configuration;
        private Boolean enabled;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        
        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getAgentId() { return agentId; }
        public void setAgentId(Long agentId) { this.agentId = agentId; }
        public String getAgentName() { return agentName; }
        public void setAgentName(String agentName) { this.agentName = agentName; }
        public Map<String, Object> getConfiguration() { return configuration; }
        public void setConfiguration(Map<String, Object> configuration) { this.configuration = configuration; }
        public Boolean getEnabled() { return enabled; }
        public void setEnabled(Boolean enabled) { this.enabled = enabled; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }
    
    /**
     * Row Mapper
     */
    private class MentisAgentConfigRowMapper implements RowMapper<MentisAgentConfigEntity> {
        @Override
        public MentisAgentConfigEntity mapRow(ResultSet rs, int rowNum) throws SQLException {
            MentisAgentConfigEntity entity = new MentisAgentConfigEntity();
            entity.setId(rs.getLong("id"));
            entity.setAgentId(rs.getLong("agent_id"));
            entity.setAgentName(rs.getString("agent_name"));
            
            String configJson = rs.getString("configuration");
            entity.setConfiguration(convertJsonToMap(configJson));
            
            entity.setEnabled(rs.getBoolean("enabled"));
            entity.setCreatedAt(rs.getTimestamp("created_at") != null ? 
                rs.getTimestamp("created_at").toLocalDateTime() : null);
            entity.setUpdatedAt(rs.getTimestamp("updated_at") != null ? 
                rs.getTimestamp("updated_at").toLocalDateTime() : null);
            return entity;
        }
    }
}
