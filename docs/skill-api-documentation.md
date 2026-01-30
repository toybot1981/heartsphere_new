# 技能管理 API 文档

## 概述

本文档说明技能管理相关的 REST API 接口。**重要**：系统已重构为纯 LLM 驱动，只支持新格式技能（Claude Skills 规范），不再支持旧格式（`function_schema`）。

## 基础信息

### 基础 URL
```
http://localhost:8081/api/skills
```

### 认证
所有 API 请求需要在 HTTP Header 中提供有效的 Bearer Token：
```
Authorization: Bearer {token}
```

### 内容类型
所有请求和响应都使用 JSON 格式：
```
Content-Type: application/json
```

## API 端点

### 1. 获取所有技能

获取系统中的所有技能列表。

#### 请求
```http
GET /api/skills
GET /api/skills?category={category}
GET /api/skills?skillType={skillType}
GET /api/skills?executionType={executionType}
```

#### 查询参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `category` | string | ❌ | 技能分类 |
| `skillType` | string | ❌ | 技能类型（ACTIVE/PASSIVE） |
| `executionType` | string | ❌ | 执行类型 |

#### 响应 200 OK
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "skillId": "web-search",
      "name": "网页搜索",
      "description": "搜索互联网内容",
      "category": "utility",
      "skillType": "ACTIVE",
      "executionType": "API",
      "mcpToolConfig": "{\"mcpServerId\": 1, \"tools\": [\"web_search\"]}",
      "skillContent": "---\nskill_id: web-search\n...\n---\n## 指令\n...",
      "license": "MIT",
      "compatibility": "{\"minVersion\": \"1.0.0\"}",
      "metadata": "{}",
      "createdAt": "2026-01-27T10:00:00",
      "updatedAt": "2026-01-27T10:00:00"
    }
  ]
}
```

**注意**：
- 返回的技能都是符合新规范（Claude Skills）的技能
- 旧格式技能（使用 `function_schema`）已被删除
- 所有技能都包含 `skillContent` 字段（完整的 SKILL.md 格式内容）

### 2. 获取可用技能

获取可用于工具调用的技能（有 `mcp_tool_config` 的技能）。

#### 请求
```http
GET /api/skills/available
```

#### 响应 200 OK
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "skillId": "web-search",
      "name": "网页搜索",
      "description": "搜索互联网内容",
      "mcpToolConfig": "{\"mcpServerId\": 1, \"tools\": [\"web_search\"]}",
      ...
    }
  ]
}
```

**注意**：
- 只返回有 `mcp_tool_config` 的技能
- 已移除对 `function_schema` 的判断
- 这些技能可以用于 LLM 的工具调用

### 3. 根据技能ID获取技能

获取指定技能ID的详细信息。

#### 请求
```http
GET /api/skills/{skillId}
```

#### 路径参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `skillId` | string | 技能ID |

#### 响应 200 OK
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "skillId": "web-search",
    "name": "网页搜索",
    "description": "搜索互联网内容",
    "skillContent": "---\nskill_id: web-search\n...\n---\n## 指令\n...",
    "mcpToolConfig": "{\"mcpServerId\": 1, \"tools\": [\"web_search\"]}",
    ...
  }
}
```

### 4. 获取角色可用技能

获取指定角色可用的技能列表（用于 Function Calling）。

#### 请求
```http
GET /api/skills/character/{characterId}
```

#### 路径参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `characterId` | long | 角色ID |

#### 响应 200 OK
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "mcpToolSkills": [
      {
        "skillId": "web-search",
        "name": "网页搜索",
        "description": "搜索互联网内容",
        "functionDefinition": {
          "name": "web-search",
          "description": "搜索互联网内容",
          "parameters": {...}
        }
      }
    ],
    "promptDrivenSkills": [
      {
        "skillId": "text-analysis",
        "name": "文本分析",
        "description": "分析文本内容"
      }
    ]
  }
}
```

**注意**：
- `mcpToolSkills`：有 `mcp_tool_config` 的技能，可以用于工具调用
- `promptDrivenSkills`：没有 `mcp_tool_config` 的技能，通过提示词驱动
- 已移除对 `function_schema` 的支持

### 5. 获取角色所有技能

获取指定角色的所有技能（包括提示词驱动技能）。

#### 请求
```http
GET /api/skills/character/{characterId}/all
```

#### 路径参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `characterId` | long | 角色ID |

#### 响应 200 OK
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "skillId": "web-search",
      "name": "网页搜索",
      "description": "搜索互联网内容",
      "mcpToolConfig": "{\"mcpServerId\": 1, \"tools\": [\"web_search\"]}",
      ...
    }
  ]
}
```

## 数据模型

### SkillDefinitionDTO

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | Long | 数据库ID |
| `skillId` | String | 技能ID（唯一标识） |
| `name` | String | 技能名称 |
| `description` | String | 技能描述 |
| `category` | String | 技能分类 |
| `skillType` | String | 技能类型（ACTIVE/PASSIVE） |
| `executionType` | String | 执行类型 |
| `mcpToolConfig` | String | MCP工具配置（JSON格式） |
| `skillContent` | String | 完整的 SKILL.md 格式内容 |
| `license` | String | 许可证信息 |
| `compatibility` | String | 兼容性信息（JSON格式） |
| `metadata` | String | 自定义元数据（JSON格式） |
| `createdAt` | LocalDateTime | 创建时间 |
| `updatedAt` | LocalDateTime | 更新时间 |

**已移除字段**：
- `functionSchema`：已废弃，改用 `mcpToolConfig`

## 错误处理

### 400 Bad Request
```json
{
  "code": 400,
  "message": "请求参数错误",
  "data": null
}
```

### 404 Not Found
```json
{
  "code": 404,
  "message": "技能不存在: {skillId}",
  "data": null
}
```

### 500 Internal Server Error
```json
{
  "code": 500,
  "message": "服务器内部错误",
  "data": null
}
```

## 重要变更说明

### 1. 技能格式变更

**旧格式**（已不再支持）：
- 使用 `function_schema` 定义技能参数
- 可能缺少 `skill_content`、`mcp_tool_config` 等字段

**新格式**（当前支持）：
- 必须包含 `skill_content`（完整的 SKILL.md 格式内容）
- 如果使用工具调用，必须包含 `mcp_tool_config`
- 不再使用 `function_schema`

### 2. API 行为变更

- `/api/skills/available`：只返回有 `mcp_tool_config` 的技能
- `/api/skills/character/{characterId}`：返回的技能都是新格式
- 所有旧格式技能已被删除

### 3. 技能选择机制

系统现在完全基于 LLM 进行技能发现和调用：
- **阶段1（发现）**：LLM 分析用户意图，从所有可用技能中发现可能相关的技能
- **阶段2（评估）**：LLM 深度评估候选技能的适用性
- **阶段3（选择）**：LLM 选择最合适的技能组合
- **阶段4（执行）**：系统执行选定的技能并处理结果

不再支持规则匹配（关键词匹配、字符串包含等）。

## 使用示例

### 示例1：获取所有技能
```bash
curl -X GET "http://localhost:8081/api/skills" \
  -H "Authorization: Bearer {token}"
```

### 示例2：获取可用技能
```bash
curl -X GET "http://localhost:8081/api/skills/available" \
  -H "Authorization: Bearer {token}"
```

### 示例3：获取角色可用技能
```bash
curl -X GET "http://localhost:8081/api/skills/character/1" \
  -H "Authorization: Bearer {token}"
```

## 相关文档

- 迁移指南：`docs/skill-engine-refactor-migration-guide.md`
- 测试计划：`docs/skill-engine-llm-only-testing-plan.md`
- 技能创建指南：`openspec/changes/build-professional-skill-creator/README.md`

## 更新日志

- **2026-01-27**：重构为纯 LLM 驱动，移除规则匹配，只支持新格式技能
