# Change: 重构技能引擎为纯 LLM 驱动并移除所有旧技能

## Why

当前技能系统存在以下问题：

1. **新旧格式并存** - 系统中同时存在使用 `function_schema` 的旧技能和使用 `mcp_tool_config` 的新技能，格式不统一
2. **规则匹配过时** - 现有的规则匹配机制（关键词匹配、字符串包含等）无法准确理解用户意图，导致技能选择不准确
3. **引擎架构复杂** - 同时支持规则驱动和 LLM 驱动两套机制，增加了系统复杂性和维护成本
4. **降级机制冗余** - LLM 驱动失败时降级到规则驱动，但规则驱动本身不够准确，降级意义不大
5. **不符合主流实践** - 现代 AI 系统（如 Claude）完全基于 LLM 进行技能发现和调用，不再使用规则匹配

为了彻底解决这些问题，需要：
- 删除所有旧格式技能，只保留符合新规范（Claude Skills）的技能
- 移除规则匹配机制，完全采用 LLM 多阶段发现和调用
- 重构技能引擎，简化为纯 LLM 驱动架构
- 更新前后端代码，移除对旧格式和规则匹配的支持

## What Changes

- **删除所有旧技能** - 清理数据库中所有不符合新规范的技能（使用 function_schema 或缺少新规范字段的技能）
- **移除规则匹配** - 删除 `SkillApplicationEngine` 中的规则匹配逻辑（关键词匹配、字符串包含等）
- **纯 LLM 驱动架构** - 技能引擎完全基于 LLM 多阶段发现和调用，不再支持规则匹配
- **简化引擎代码** - 移除降级机制、规则驱动引擎、评分服务等冗余代码
- **更新前后端** - 管理端和主工程的前后端都移除对旧格式和规则匹配的支持
- **统一技能格式** - 所有技能必须符合 Claude Skills 规范，包含完整的 skillContent、mcpToolConfig 等字段

## Impact

- **Affected specs**: 
  - 修改 `skill-creation` 能力规范
  - 修改 `skill-migration` 能力规范
  - 修改 `skill-selection` 能力规范（移除规则匹配）
  
- **Affected code**: 
  - `admin/backend`: 移除旧技能查询、规则匹配相关代码
  - `admin/frontend`: 移除旧格式字段的显示和编辑
  - `main/backend`: 
    - 删除 `SkillApplicationEngine` 中的规则匹配逻辑
    - 删除 `SkillScoringService` 中的规则评分逻辑
    - 简化 `LLMSkillApplicationEngine`，移除降级机制
    - 更新 `SkillRegistry`，移除对 function_schema 的支持
    - 更新所有技能查询，只返回新格式技能
  - `main/frontend`: 移除对旧格式字段的显示
  - 数据库：删除所有旧技能数据
  
- **Affected data**: 
  - `skill_definitions` 表中的所有旧技能将被删除
  - `character_skill_bindings` 表中的绑定需要清理（如果绑定到已删除的技能）
