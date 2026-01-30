# 向后兼容实现说明

## 概述

为了确保在迁移过程中系统能够正常工作，我们实现了向后兼容支持，允许系统同时处理新旧两种格式的技能。

## 实现位置

### 1. SkillRegistry (main/backend)

**文件**: `main/backend/src/main/java/com/heartsphere/skill/service/SkillRegistry.java`

**方法**: `toFunctionDefinition(SkillDefinition skill)`

**实现逻辑**:
1. **优先使用新格式**: 检查 `mcp_tool_config` 字段
   - 如果存在且不为空，调用 `toFunctionDefinitionFromMcpConfig()`
   - 从 MCP 工具配置构建 Function Definition

2. **降级使用旧格式**: 如果新格式不存在，检查 `function_schema` 字段
   - 如果存在且不为空，调用 `toFunctionDefinitionFromSchema()`
   - 记录日志提示建议迁移到新格式

3. **记录使用情况**: 通过日志记录使用旧格式的技能，便于后续迁移

### 2. LLMBasedSkillExecutor (main/backend)

**文件**: `main/backend/src/main/java/com/heartsphere/skill/service/executor/LLMBasedSkillExecutor.java`

**方法**: `buildSystemInstruction(SkillDefinition skill, List<SkillInstruction> instructions)`

**实现逻辑**:
1. **优先使用新格式**: 检查 `skill_content` 字段
   - 如果存在且不为空，调用 `buildSystemInstructionFromSkillContent()`
   - 从 SKILL.md 格式内容中提取指令部分

2. **降级使用旧格式**: 如果新格式不存在，使用 `skill_instructions` 表
   - 调用 `buildSystemInstructionFromInstructions()`
   - 从数据库表中读取 Level 2 指令
   - 记录日志提示建议迁移到新格式

## 格式优先级

### Function Definition 转换

```
mcp_tool_config (新格式)
    ↓ (如果不存在)
function_schema (旧格式)
    ↓ (如果不存在)
返回 null（跳过该技能）
```

### 指令构建

```
skill_content (新格式)
    ↓ (如果不存在)
skill_instructions 表 (旧格式)
    ↓ (如果不存在)
使用 description 作为基础指令
```

## 日志记录

系统会记录以下信息：

1. **使用旧格式时的警告**:
   ```
   DEBUG: 技能 {skillId} 使用旧格式 function_schema，建议迁移到 mcp_tool_config
   DEBUG: 技能 {skillId} 使用旧格式 skill_instructions，建议迁移到 skill_content
   ```

2. **格式转换失败时的错误**:
   ```
   ERROR: 从 mcp_tool_config 转换技能 {skillId} 失败
   ERROR: 从 function_schema 转换技能 {skillId} 失败
   ```

## 迁移建议

通过日志可以识别需要迁移的技能：

```bash
# 查找使用旧格式的技能
grep "使用旧格式" application.log | grep "function_schema"
grep "使用旧格式" application.log | grep "skill_instructions"
```

## 测试建议

1. **测试新格式技能**: 确保使用 `mcp_tool_config` 和 `skill_content` 的技能正常工作
2. **测试旧格式技能**: 确保使用 `function_schema` 和 `skill_instructions` 的技能仍然正常工作
3. **测试混合格式**: 确保同时存在新旧格式技能时系统正常工作
4. **测试降级逻辑**: 确保新格式不存在时能正确降级到旧格式

## 性能影响

- **新格式**: 直接从字段读取，性能更好
- **旧格式**: 需要查询数据库表，性能略差
- **建议**: 尽快完成迁移，减少对旧格式的依赖

## 后续计划

1. **监控使用情况**: 通过日志监控旧格式技能的使用频率
2. **逐步迁移**: 优先迁移使用频率高的技能
3. **完全移除**: 所有技能迁移完成后，移除旧格式支持代码
