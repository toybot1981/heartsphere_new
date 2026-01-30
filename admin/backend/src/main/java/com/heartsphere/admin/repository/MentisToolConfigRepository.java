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
 * Mentis 工具配置 Repository
 * 直接访问 Mentis 数据库
 */
@Repository
public class MentisToolConfigRepository {
    
    private final JdbcTemplate jdbcTemplate;
    
    public MentisToolConfigRepository(JdbcTemplate jdbcTemplate) {
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
     * 查找所有工具配置
     */
    public List<MentisToolConfigEntity> findAll() {
        try {
            switchToMentisDataSource();
            return jdbcTemplate.query(
                "SELECT * FROM tool_configs ORDER BY tool_name ASC",
                new MentisToolConfigRowMapper()
            );
        } finally {
            restoreDefaultDataSource();
        }
    }
    
    /**
     * 根据工具名称查找
     */
    public Optional<MentisToolConfigEntity> findByToolName(String toolName) {
        try {
            switchToMentisDataSource();
            List<MentisToolConfigEntity> results = jdbcTemplate.query(
                "SELECT * FROM tool_configs WHERE tool_name = ?",
                new MentisToolConfigRowMapper(),
                toolName
            );
            return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
        } finally {
            restoreDefaultDataSource();
        }
    }
    
    /**
     * 根据分类查找所有启用的配置
     */
    public List<MentisToolConfigEntity> findByCategoryAndIsActiveTrue(String category) {
        try {
            switchToMentisDataSource();
            return jdbcTemplate.query(
                "SELECT * FROM tool_configs WHERE category = ? AND is_active = 1 ORDER BY tool_name ASC",
                new MentisToolConfigRowMapper(),
                category
            );
        } finally {
            restoreDefaultDataSource();
        }
    }
    
    /**
     * 查找所有启用的配置
     */
    public List<MentisToolConfigEntity> findByIsActiveTrue() {
        try {
            switchToMentisDataSource();
            return jdbcTemplate.query(
                "SELECT * FROM tool_configs WHERE is_active = 1 ORDER BY tool_name ASC",
                new MentisToolConfigRowMapper()
            );
        } finally {
            restoreDefaultDataSource();
        }
    }
    
    /**
     * 检查工具配置是否存在
     */
    public boolean existsByToolName(String toolName) {
        try {
            switchToMentisDataSource();
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM tool_configs WHERE tool_name = ?",
                Integer.class,
                toolName
            );
            return count != null && count > 0;
        } finally {
            restoreDefaultDataSource();
        }
    }
    
    /**
     * 保存工具配置
     */
    public MentisToolConfigEntity save(MentisToolConfigEntity entity) {
        try {
            switchToMentisDataSource();
            if (entity.getId() == null) {
                // Insert
                jdbcTemplate.update(
                    "INSERT INTO tool_configs (tool_name, description, category, prompt_template_category, " +
                    "instruction_template, script_template, parameters_schema, is_active, created_at, updated_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    entity.getToolName(),
                    entity.getDescription(),
                    entity.getCategory(),
                    entity.getPromptTemplateCategory(),
                    entity.getInstructionTemplate(),
                    entity.getScriptTemplate(),
                    entity.getParametersSchema(),
                    entity.getIsActive(),
                    LocalDateTime.now(),
                    LocalDateTime.now()
                );
                // 获取生成的 ID
                Long id = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
                entity.setId(id);
            } else {
                // Update
                jdbcTemplate.update(
                    "UPDATE tool_configs SET description = ?, category = ?, prompt_template_category = ?, " +
                    "instruction_template = ?, script_template = ?, parameters_schema = ?, is_active = ?, updated_at = ? " +
                    "WHERE tool_name = ?",
                    entity.getDescription(),
                    entity.getCategory(),
                    entity.getPromptTemplateCategory(),
                    entity.getInstructionTemplate(),
                    entity.getScriptTemplate(),
                    entity.getParametersSchema(),
                    entity.getIsActive(),
                    LocalDateTime.now(),
                    entity.getToolName()
                );
            }
            return entity;
        } finally {
            restoreDefaultDataSource();
        }
    }
    
    /**
     * 删除工具配置
     */
    public void deleteByToolName(String toolName) {
        try {
            switchToMentisDataSource();
            jdbcTemplate.update("DELETE FROM tool_configs WHERE tool_name = ?", toolName);
        } finally {
            restoreDefaultDataSource();
        }
    }
    
    /**
     * Mentis 工具配置实体（内部使用）
     */
    public static class MentisToolConfigEntity {
        private Long id;
        private String toolName;
        private String description;
        private String category;
        private String promptTemplateCategory;
        private String instructionTemplate;
        private String scriptTemplate;
        private String parametersSchema;
        private Boolean isActive;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        
        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getToolName() { return toolName; }
        public void setToolName(String toolName) { this.toolName = toolName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getPromptTemplateCategory() { return promptTemplateCategory; }
        public void setPromptTemplateCategory(String promptTemplateCategory) { this.promptTemplateCategory = promptTemplateCategory; }
        public String getInstructionTemplate() { return instructionTemplate; }
        public void setInstructionTemplate(String instructionTemplate) { this.instructionTemplate = instructionTemplate; }
        public String getScriptTemplate() { return scriptTemplate; }
        public void setScriptTemplate(String scriptTemplate) { this.scriptTemplate = scriptTemplate; }
        public String getParametersSchema() { return parametersSchema; }
        public void setParametersSchema(String parametersSchema) { this.parametersSchema = parametersSchema; }
        public Boolean getIsActive() { return isActive; }
        public void setIsActive(Boolean isActive) { this.isActive = isActive; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }
    
    /**
     * Row Mapper
     */
    private static class MentisToolConfigRowMapper implements RowMapper<MentisToolConfigEntity> {
        @Override
        public MentisToolConfigEntity mapRow(ResultSet rs, int rowNum) throws SQLException {
            MentisToolConfigEntity entity = new MentisToolConfigEntity();
            entity.setId(rs.getLong("id"));
            entity.setToolName(rs.getString("tool_name"));
            entity.setDescription(rs.getString("description"));
            entity.setCategory(rs.getString("category"));
            entity.setPromptTemplateCategory(rs.getString("prompt_template_category"));
            entity.setInstructionTemplate(rs.getString("instruction_template"));
            entity.setScriptTemplate(rs.getString("script_template"));
            entity.setParametersSchema(rs.getString("parameters_schema"));
            entity.setIsActive(rs.getBoolean("is_active"));
            entity.setCreatedAt(rs.getTimestamp("created_at") != null ? 
                rs.getTimestamp("created_at").toLocalDateTime() : null);
            entity.setUpdatedAt(rs.getTimestamp("updated_at") != null ? 
                rs.getTimestamp("updated_at").toLocalDateTime() : null);
            return entity;
        }
    }
}
