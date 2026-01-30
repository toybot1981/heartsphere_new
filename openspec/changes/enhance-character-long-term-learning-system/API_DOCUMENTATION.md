# 角色长期学习系统 - API 文档

## 概述

本文档详细说明了角色长期学习系统的所有 REST API 端点、请求/响应格式、错误处理和使用示例。

---

## 目录

1. [认证](#认证)
2. [基础信息](#基础信息)
3. [API 端点](#api-端点)
4. [数据模型](#数据模型)
5. [错误处理](#错误处理)
6. [使用示例](#使用示例)

---

## 认证

所有 API 请求都需要在 HTTP Header 中提供有效的 Bearer Token：

```bash
Authorization: Bearer {token}
```

获取 Token 的方式请参考系统认证文档。

---

## 基础信息

### 基础 URL

```
https://api.heartsphere.com/api/memory/v1
```

### 内容类型

所有请求和响应都使用 JSON 格式：

```
Content-Type: application/json
```

### 时间格式

所有时间戳使用 ISO 8601 格式：

```
2026-01-24T12:30:45.123Z
```

---

## API 端点

### 1. 创建知识资产

创建一个新的角色知识资产，通常由前端在对话完成后自动触发或手动创建。

#### 请求

```http
POST /character/{characterId}/assets
Authorization: Bearer {token}
Content-Type: application/json

{
  "assetType": "DOMAIN_KNOWLEDGE",
  "title": "投资风险管理基础",
  "content": "风险管理是投资的核心。投资者应该根据风险承受能力制定投资策略...",
  "summary": "投资风险管理的基本原则和方法"
}
```

#### 路径参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `characterId` | long | 角色 ID |

#### 请求体

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `assetType` | string | ✅ | 资产类型：`DOMAIN_KNOWLEDGE`, `INTERACTION_SKILLS`, `DECISION_RULES`, `EXPERIENCE_PATTERNS` |
| `title` | string | ✅ | 资产标题（最多 255 字符） |
| `content` | string | ✅ | 完整内容（支持 Unicode） |
| `summary` | string | ❌ | 摘要（用于相似度检测，最多 500 字符） |

#### 响应 200 OK

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1001,
    "characterId": 123,
    "assetType": "DOMAIN_KNOWLEDGE",
    "title": "投资风险管理基础",
    "trustScore": 50,
    "usageCount": 0,
    "isApproved": false,
    "createdAt": "2026-01-24T12:30:45.123Z"
  }
}
```

#### 响应 400 Bad Request

```json
{
  "code": 400,
  "message": "Content contains sensitive information",
  "data": null
}
```

#### 响应 404 Not Found

```json
{
  "code": 404,
  "message": "Character not found",
  "data": null
}
```

#### 错误代码

| 代码 | 原因 |
|------|------|
| 400 | 隐私检测：内容包含敏感信息 |
| 400 | 相似度检测：已存在相似的资产 |
| 400 | 验证失败：标题或内容为空 |
| 404 | 角色不存在 |
| 500 | 服务器内部错误 |

---

### 2. 获取相关资产

根据查询条件获取角色的相关知识资产列表，支持全文搜索。

#### 请求

```http
GET /character/{characterId}/related-assets?query=投资&limit=10&offset=0
Authorization: Bearer {token}
```

#### 路径参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `characterId` | long | 角色 ID |

#### 查询参数

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `query` | string | 空 | 搜索关键词 |
| `limit` | int | 10 | 返回的最大结果数（1-100） |
| `offset` | int | 0 | 分页偏移 |
| `type` | string | 空 | 筛选资产类型 |
| `approved` | boolean | 空 | 筛选审核状态 |

#### 响应 200 OK

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1001,
      "characterId": 123,
      "assetType": "DOMAIN_KNOWLEDGE",
      "title": "投资风险管理基础",
      "content": "风险管理是投资的核心。投资者应该根据风险承受能力制定投资策略...",
      "trustScore": 75,
      "usageCount": 12,
      "isApproved": true,
      "createdAt": "2026-01-20T10:00:00.000Z",
      "lastUsedAt": "2026-01-24T09:15:00.000Z"
    },
    {
      "id": 1002,
      "characterId": 123,
      "assetType": "INTERACTION_SKILLS",
      "title": "如何解释复杂的投资概念",
      "content": "当用户不理解投资术语时，应该用生活中的例子来解释...",
      "trustScore": 62,
      "usageCount": 8,
      "isApproved": false,
      "createdAt": "2026-01-22T14:20:00.000Z",
      "lastUsedAt": "2026-01-23T11:30:00.000Z"
    }
  ]
}
```

#### 响应 404 Not Found

```json
{
  "code": 404,
  "message": "Character not found",
  "data": null
}
```

---

### 3. 提交资产反馈

用户对某个知识资产的反馈，用于调整资产的信任度。

#### 请求

```http
POST /assets/{assetId}/feedback
Authorization: Bearer {token}
Content-Type: application/json

{
  "feedbackType": "positive",
  "comment": "这个资产帮助我更好地理解了投资风险"
}
```

#### 路径参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `assetId` | long | 资产 ID |

#### 请求体

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `feedbackType` | string | ✅ | 反馈类型：`positive` (赞同) 或 `negative` (不赞同) |
| `comment` | string | ❌ | 反馈评论（最多 500 字符） |

#### 响应 200 OK

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "assetId": 1001,
    "newTrustScore": 78,
    "positiveFeedbackCount": 5,
    "negativeFeedbackCount": 1
  }
}
```

#### 响应 404 Not Found

```json
{
  "code": 404,
  "message": "Asset not found",
  "data": null
}
```

---

### 4. 获取角色学习统计

获取角色的学习统计信息，包括等级、资产统计、信任度等。

#### 请求

```http
GET /character/{characterId}/stats
Authorization: Bearer {token}
```

#### 路径参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `characterId` | long | 角色 ID |

#### 响应 200 OK

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "experienceLevel": 3,
    "experienceLevelName": "中级 (L3)",
    "totalAssets": 45,
    "approvedAssets": 38,
    "pendingAssets": 7,
    "averageTrustScore": 0.72,
    "levelDescription": "这个角色已经积累了丰富的知识，能够处理大多数常见问题。",
    "progressPercentage": 65,
    "nextLevelAssetRequirement": 51,
    "nextLevelTrustRequirement": 80
  }
}
```

#### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `experienceLevel` | int | 经验等级 (1-5) |
| `experienceLevelName` | string | 等级名称 |
| `totalAssets` | int | 总资产数 |
| `approvedAssets` | int | 已批准资产数 |
| `pendingAssets` | int | 待审核资产数 |
| `averageTrustScore` | double | 平均信任度 (0-1) |
| `levelDescription` | string | 等级描述 |
| `progressPercentage` | int | 晋升进度 (0-100) |
| `nextLevelAssetRequirement` | int | 下一等级所需资产数 |
| `nextLevelTrustRequirement` | int | 下一等级所需信任度 (%) |

#### 响应 404 Not Found

```json
{
  "code": 404,
  "message": "Character not found",
  "data": null
}
```

---

## 数据模型

### 知识资产 (KnowledgeAsset)

```json
{
  "id": 1001,
  "characterId": 123,
  "assetType": "DOMAIN_KNOWLEDGE",
  "title": "投资风险管理基础",
  "content": "完整的资产内容...",
  "summary": "摘要",
  "trustScore": 75,
  "usageCount": 12,
  "positiveFeadbackCount": 4,
  "negativeFeedbackCount": 1,
  "isApproved": true,
  "approvedBy": "admin_001",
  "createdAt": "2026-01-20T10:00:00.000Z",
  "updatedAt": "2026-01-24T09:15:00.000Z",
  "lastUsedAt": "2026-01-24T09:15:00.000Z"
}
```

### 资产类型

| 类型 | 代码 | 说明 |
|------|------|------|
| 领域知识 | `DOMAIN_KNOWLEDGE` | 与专业领域相关的通用知识 |
| 交互技巧 | `INTERACTION_SKILLS` | 与用户交互相关的技巧 |
| 决策规则 | `DECISION_RULES` | 特定场景下的决策规则 |
| 经验模式 | `EXPERIENCE_PATTERNS` | 重复出现的经验模式 |

### 经验等级

| 级别 | 名称 | 所需资产数 | 所需信任度 | 描述 |
|------|------|----------|---------|------|
| 1 | 新手 (L1) | 0-5 | - | 刚开始学习，知识有限 |
| 2 | 初级 (L2) | 6-20 | ≥60% | 掌握基本概念，可处理简单问题 |
| 3 | 中级 (L3) | 21-50 | ≥70% | 知识丰富，能处理大多数问题 |
| 4 | 高级 (L4) | 51-100 | ≥80% | 经验丰富，能处理复杂问题 |
| 5 | 专家 (L5) | >100 | ≥85% | 知识渊博，是真正的专家 |

---

## 错误处理

### 标准错误响应

所有错误响应都遵循以下格式：

```json
{
  "code": 400,
  "message": "Error message",
  "data": null
}
```

### 常见 HTTP 状态码

| 状态码 | 含义 |
|--------|------|
| 200 | 成功 |
| 400 | 请求错误（参数验证失败、业务规则冲突等） |
| 401 | 未认证（缺少或无效的 Token） |
| 403 | 无权限（当前用户无权访问该资源） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 常见错误代码

| 错误代码 | 含义 | 解决方案 |
|---------|------|--------|
| `SENSITIVE_INFO_DETECTED` | 内容包含敏感信息 | 修改内容，移除敏感信息 |
| `SIMILAR_ASSET_EXISTS` | 已存在相似的资产 | 检查是否重复，或合并现有资产 |
| `INVALID_CHARACTER_ID` | 无效的角色 ID | 检查角色 ID 是否正确 |
| `INVALID_ASSET_ID` | 无效的资产 ID | 检查资产 ID 是否正确 |
| `ASSET_NOT_APPROVED` | 资产未通过审核 | 等待管理员审核 |

---

## 使用示例

### 示例 1: 创建一个知识资产

```bash
curl -X POST https://api.heartsphere.com/api/memory/v1/character/123/assets \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "assetType": "DOMAIN_KNOWLEDGE",
    "title": "股票投资基础知识",
    "content": "股票是上市公司向公众发行的所有权凭证。投资者购买股票意味着拥有公司的一部分...",
    "summary": "股票的基本概念和特点"
  }'
```

### 示例 2: 搜索相关资产

```bash
curl https://api.heartsphere.com/api/memory/v1/character/123/related-assets?query=股票&limit=5 \
  -H "Authorization: Bearer eyJhbGc..."
```

### 示例 3: 提交正面反馈

```bash
curl -X POST https://api.heartsphere.com/api/memory/v1/assets/1001/feedback \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "feedbackType": "positive",
    "comment": "这个资产很有帮助，清晰地解释了股票投资"
  }'
```

### 示例 4: 获取学习统计

```bash
curl https://api.heartsphere.com/api/memory/v1/character/123/stats \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## 速率限制

为了防止滥用，API 实施了速率限制：

- **免费用户**: 100 请求/小时
- **付费用户**: 1000 请求/小时
- **企业用户**: 无限制

超过限制时返回 429 Too Many Requests。

---

## 版本控制

当前 API 版本：**v1**

历史版本将在弃用 6 个月后移除。

---

最后更新：2026-01-24
