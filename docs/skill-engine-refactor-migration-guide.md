# 技能引擎重构迁移指南

## 概述

本文档说明技能引擎从规则驱动重构为纯 LLM 驱动的迁移过程。

## 变更内容

### 1. 架构变更

**之前**：
- LLM 驱动（主要）+ 规则驱动（降级/备用）
- 支持关键词匹配、字符串包含、规则评分

**现在**：
- 纯 LLM 驱动
- 多阶段发现和调用（发现 → 评估 → 选择 → 执行）
- 不再支持规则匹配

### 2. 技能格式变更

**旧格式**：
- 使用 `function_schema` 定义技能参数
- 可能缺少 `skill_content`、`mcp_tool_config` 等新规范字段

**新格式**：
- 必须包含 `skill_content`（完整的 SKILL.md 格式内容）
- 如果使用工具调用，必须包含 `mcp_tool_config`
- 不再使用 `function_schema`

### 3. 配置变更

**application.yml**：
```yaml
skill:
  selection:
    llm-driven:
      enabled: true  # 必须启用
      level1-candidates: 10
      level2-candidates: 5
      level3-candidates: 3
      enable-level3: true
    # 已移除：rule-driven 配置
```

## 迁移步骤

### 步骤1：数据备份

执行备份脚本：
```sql
-- 创建备份表
CREATE TABLE IF NOT EXISTS skill_definitions_backup AS 
SELECT * FROM skill_definitions;

CREATE TABLE IF NOT EXISTS character_skill_bindings_backup AS 
SELECT * FROM character_skill_bindings;
```

### 步骤2：识别旧技能

查询需要删除的旧技能：
```sql
SELECT id, skill_id, name
FROM skill_definitions
WHERE 
    (function_schema IS NOT NULL AND function_schema != '')
    OR
    (skill_content IS NULL OR skill_content = '')
    OR
    ((mcp_tool_config IS NULL OR mcp_tool_config = '') 
     AND execution_type IN ('API', 'SCRIPT', 'GRAPH'));
```

### 步骤3：清理数据

执行清理脚本：`sql/cleanup_old_skills.sql`

**注意**：
- 先在生产环境的测试数据库上执行
- 验证删除结果正确后再在生产环境执行
- 保留备份数据至少30天

### 步骤4：验证

验证剩余技能都符合新规范：
```sql
SELECT 
    COUNT(*) AS total_skills,
    SUM(CASE WHEN skill_content IS NOT NULL AND skill_content != '' THEN 1 ELSE 0 END) AS has_skill_content,
    SUM(CASE WHEN mcp_tool_config IS NOT NULL AND mcp_tool_config != '' THEN 1 ELSE 0 END) AS has_mcp_tool_config
FROM skill_definitions;
```

## 回滚方案

如果迁移出现问题，可以从备份恢复：

```sql
-- 恢复技能定义
TRUNCATE TABLE skill_definitions;
INSERT INTO skill_definitions SELECT * FROM skill_definitions_backup;

-- 恢复角色技能绑定
TRUNCATE TABLE character_skill_bindings;
INSERT INTO character_skill_bindings SELECT * FROM character_skill_bindings_backup;
```

## 影响范围

### 后端
- ✅ `LLMSkillApplicationEngine`：已移除降级机制
- ✅ `SkillEngineConfig`：已移除规则驱动配置
- ✅ `SkillSelectionConfig`：已移除规则驱动配置
- ✅ `SkillRegistry`：已移除对 `function_schema` 的支持

### 前端
- ✅ 管理端：已移除 `functionSchema` 字段
- ✅ 主工程：已移除 `functionSchema` 字段

### API
- ✅ `/api/skills/available`：只返回有 `mcp_tool_config` 的技能
- ✅ `/api/skills`：返回所有技能，但旧格式技能将被删除

## 注意事项

1. **LLM 调用失败**：如果 LLM 调用失败，系统会返回空结果，不再降级到规则驱动
2. **性能影响**：LLM 驱动的技能选择可能比规则驱动慢，但准确性更高
3. **成本考虑**：LLM 调用会产生成本，建议配置缓存以减少调用次数

## 监控指标

迁移后需要监控：
- LLM 调用成功率
- 技能选择准确率
- 技能选择响应时间
- LLM 调用成本

## 支持

如有问题，请联系开发团队或查看：
- 提案文档：`openspec/changes/refactor-skill-engine-to-llm-only/`
- 设计文档：`openspec/changes/refactor-skill-engine-to-llm-only/design.md`
