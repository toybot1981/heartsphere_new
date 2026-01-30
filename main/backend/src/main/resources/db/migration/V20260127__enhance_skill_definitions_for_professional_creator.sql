-- 增强技能定义表以支持专业 Skill Creator 工具
-- 添加 Claude Skills 规范所需的元数据字段
-- 移除 Function Calling 支持，改用 MCP 工具配置
-- 创建时间：2026-01-27

-- ============================================
-- 第一部分：添加新字段
-- ============================================

-- 添加 license 字段（许可证信息）
ALTER TABLE skill_definitions 
ADD COLUMN IF NOT EXISTS license VARCHAR(100) COMMENT '许可证信息';

-- 添加 compatibility 字段（兼容性信息，JSON格式）
ALTER TABLE skill_definitions 
ADD COLUMN IF NOT EXISTS compatibility VARCHAR(255) COMMENT '兼容性信息（JSON格式）';

-- 添加 metadata 字段（自定义元数据，JSON格式）
ALTER TABLE skill_definitions 
ADD COLUMN IF NOT EXISTS metadata TEXT COMMENT '自定义元数据（JSON格式）';

-- 添加 skill_content 字段（完整的 SKILL.md 格式内容）
ALTER TABLE skill_definitions 
ADD COLUMN IF NOT EXISTS skill_content TEXT COMMENT '完整的 SKILL.md 格式内容（YAML元数据 + Markdown指令）';

-- 添加 mcp_tool_config 字段（MCP工具配置，JSON格式）
ALTER TABLE skill_definitions 
ADD COLUMN IF NOT EXISTS mcp_tool_config TEXT COMMENT 'MCP工具配置（JSON格式），存储MCP服务器配置ID、工具名称列表、参数映射等';

-- ============================================
-- 第二部分：移除 Function Calling 相关字段
-- ============================================

-- 注意：由于 function_schema 可能被现有数据使用，我们采用软删除方式
-- 先标记为废弃，后续版本再完全移除
-- 如果确实需要移除，可以执行以下语句（需要先备份数据）：
-- ALTER TABLE skill_definitions DROP COLUMN IF EXISTS function_schema;

-- 为了保持向后兼容，暂时保留 function_schema 字段
-- 但在新创建的技能中，应该使用 mcp_tool_config 替代

-- ============================================
-- 第三部分：添加索引（如果需要）
-- ============================================

-- 如果需要按 license 查询，可以添加索引
-- CREATE INDEX IF NOT EXISTS idx_license ON skill_definitions(license);
