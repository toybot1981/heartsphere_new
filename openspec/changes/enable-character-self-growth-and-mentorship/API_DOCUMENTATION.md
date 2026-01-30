# 角色自我成长和导师能力系统 API 文档

## 概述

本文档描述了角色自我成长和导师能力系统的 REST API 接口。这些接口用于管理角色的自我成长、挚友能力和导师能力。

**Base URL**: `/api/memory/v1/character`

**认证**: 所有接口都需要 Bearer Token 认证

## 成长相关 API

### 1. 获取角色成长信息

**GET** `/api/memory/v1/character/{characterId}/growth`

获取角色的成长轨迹和统计信息。

**路径参数**:
- `characterId` (Long, 必填): 角色ID

**查询参数**:
- `userId` (Long, 必填): 用户ID

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "characterId": 1,
    "userId": 100,
    "totalEvents": 15,
    "events": [...],
    "eventTypeStats": {
      "LEARNING": 5,
      "REFLECTION": 3,
      "ABILITY_UPGRADE": 4,
      "RELATIONSHIP_PROGRESS": 3
    }
  }
}
```

### 2. 获取成长轨迹

**GET** `/api/memory/v1/character/{characterId}/growth/trajectory`

获取角色的详细成长轨迹。

**路径参数**:
- `characterId` (Long, 必填): 角色ID

**查询参数**:
- `userId` (Long, 必填): 用户ID

**响应格式**: 与获取成长信息相同

### 3. 触发自我反思

**POST** `/api/memory/v1/character/{characterId}/growth/reflect`

触发角色进行自我反思。

**路径参数**:
- `characterId` (Long, 必填): 角色ID

**查询参数**:
- `userId` (Long, 必填): 用户ID
- `reflectionType` (String, 可选): 反思类型，默认为 "AUTO"
  - `AUTO`: 自动触发
  - `MANUAL`: 手动触发
  - `WEEKLY`: 每周定期
  - `MILESTONE`: 里程碑触发

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": "自我反思已触发"
}
```

## 关系相关 API

### 4. 获取关系信息

**GET** `/api/memory/v1/character/{characterId}/relationship`

获取角色与用户的关系信息和阶段。

**路径参数**:
- `characterId` (Long, 必填): 角色ID

**查询参数**:
- `userId` (Long, 必填): 用户ID

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "characterId": 1,
    "userId": 100,
    "currentStage": "CLOSE_FRIEND",
    "milestoneCount": 5,
    "milestones": [...],
    "lastTransitionAt": "2026-01-25T10:00:00"
  }
}
```

### 5. 获取关系里程碑

**GET** `/api/memory/v1/character/{characterId}/relationship/milestones`

获取角色与用户的关系里程碑列表。

**路径参数**:
- `characterId` (Long, 必填): 角色ID

**查询参数**:
- `userId` (Long, 必填): 用户ID

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": [
    {
      "id": 1,
      "milestoneType": "STAGE_TRANSITION",
      "fromStage": "FRIEND",
      "toStage": "CLOSE_FRIEND",
      "title": "关系阶段: 朋友 → 挚友",
      "description": "关系深度分数: 65",
      "createdAt": "2026-01-25T10:00:00"
    }
  ]
}
```

### 6. 获取关系深度

**GET** `/api/memory/v1/character/{characterId}/relationship/depth`

计算并获取角色与用户的关系深度。

**路径参数**:
- `characterId` (Long, 必填): 角色ID

**查询参数**:
- `userId` (Long, 必填): 用户ID
- `interactionCount` (Integer, 可选): 交互次数，默认 0
- `emotionalConnectionScore` (Integer, 可选): 情感连接分数，默认 0
- `sharedExperienceCount` (Integer, 可选): 共同经历数量，默认 0
- `positiveFeedbackRatio` (Double, 可选): 正面反馈比例，默认 0.5
- `daysSinceFirstInteraction` (Long, 可选): 首次交互至今的天数，默认 1

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "characterId": 1,
    "userId": 100,
    "stage": "CLOSE_FRIEND",
    "stageName": "挚友"
  }
}
```

## 导师相关 API

### 7. 获取导师能力

**GET** `/api/memory/v1/character/{characterId}/mentorship/capabilities`

获取角色的导师能力评估结果。

**路径参数**:
- `characterId` (Long, 必填): 角色ID

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "characterId": 1,
    "totalScore": 75,
    "knowledgeScore": 80,
    "guidanceScore": 70,
    "totalAssets": 50,
    "approvedAssets": 45,
    "averageTrustScore": 82.5,
    "capabilityLevel": "ADVANCED"
  }
}
```

### 8. 创建指导会话

**POST** `/api/memory/v1/character/{characterId}/mentorship/sessions`

创建新的导师指导会话。

**路径参数**:
- `characterId` (Long, 必填): 角色ID

**查询参数**:
- `userId` (Long, 必填): 用户ID
- `sessionType` (String, 必填): 会话类型
  - `ACTIVE_GUIDANCE`: 主动指导
  - `PERSONALIZED_EDUCATION`: 个性化教育
  - `GROWTH_PLANNING`: 成长规划
- `title` (String, 必填): 会话标题
- `content` (String, 可选): 指导内容

**请求体** (可选):
```json
[
  "理解核心概念",
  "掌握关键技能",
  "应用所学知识"
]
```

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": 1,
    "characterId": 1,
    "userId": 100,
    "sessionType": "ACTIVE_GUIDANCE",
    "title": "主动指导: 如何提高学习效率",
    "status": "ACTIVE",
    "startedAt": "2026-01-25T10:00:00"
  }
}
```

### 9. 获取指导会话列表

**GET** `/api/memory/v1/character/{characterId}/mentorship/sessions`

获取角色与用户的指导会话列表。

**路径参数**:
- `characterId` (Long, 必填): 角色ID

**查询参数**:
- `userId` (Long, 必填): 用户ID
- `activeOnly` (Boolean, 可选): 是否仅显示进行中的会话，默认 false

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": [
    {
      "id": 1,
      "sessionType": "ACTIVE_GUIDANCE",
      "title": "主动指导: 如何提高学习效率",
      "status": "ACTIVE",
      "startedAt": "2026-01-25T10:00:00"
    }
  ]
}
```

### 10. 创建成长计划

**POST** `/api/memory/v1/character/{characterId}/mentorship/plan`

为用户创建成长规划。

**路径参数**:
- `characterId` (Long, 必填): 角色ID

**查询参数**:
- `userId` (Long, 必填): 用户ID
- `planTitle` (String, 必填): 计划标题

**请求体**:
```json
[
  {
    "objective": "掌握基础技能",
    "targetDate": "2026-02-01",
    "description": "学习并掌握基础技能"
  },
  {
    "objective": "应用实践",
    "targetDate": "2026-02-15",
    "description": "将所学知识应用到实践中"
  }
]
```

**响应格式**: 与创建指导会话相同

## 情境感知和模式切换 API

### 11. 分析对话情境

**POST** `/api/memory/v1/character/{characterId}/context/analyze`

分析对话情境并推荐响应模式。

**路径参数**:
- `characterId` (Long, 必填): 角色ID

**查询参数**:
- `userId` (Long, 必填): 用户ID
- `userMessage` (String, 必填): 用户消息
- `userEmotionState` (String, 可选): 用户情绪状态

**请求体** (可选):
```json
[
  "之前的对话消息1",
  "之前的对话消息2"
]
```

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "userIntent": "SEEK_GUIDANCE",
    "hasEmotionalNeed": false,
    "hasLearningNeed": true,
    "recommendedMode": "MENTOR",
    "recommendedModeName": "导师模式",
    "recommendedModeDescription": "专业、指导、启发、教育",
    "confidence": 0.8
  }
}
```

### 12. 智能模式切换

**POST** `/api/memory/v1/character/{characterId}/mode/switch`

根据情境智能切换角色响应模式。

**路径参数**:
- `characterId` (Long, 必填): 角色ID

**查询参数**:
- `userId` (Long, 必填): 用户ID
- `userMessage` (String, 必填): 用户消息
- `currentMode` (String, 可选): 当前模式
- `userEmotionState` (String, 可选): 用户情绪状态

**请求体** (可选): 对话历史

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "currentMode": "NEUTRAL",
    "recommendedMode": "MENTOR",
    "shouldSwitch": true,
    "confidence": 0.8,
    "transitionMessage": "让我以导师的身份为你提供指导。"
  }
}
```

## 错误响应

所有接口在出错时返回以下格式：

```json
{
  "code": 400,
  "message": "错误描述",
  "data": null,
  "timestamp": "2026-01-25T10:00:00"
}
```

**常见错误码**:
- `400`: 请求参数错误
- `401`: 未认证
- `403`: 无权限
- `404`: 资源不存在
- `500`: 服务器内部错误

## 关系阶段说明

- `STRANGER` (陌生人): 关系深度分数 0-30
- `FRIEND` (朋友): 关系深度分数 30-60
- `CLOSE_FRIEND` (挚友): 关系深度分数 60-80
- `MENTOR` (导师): 关系深度分数 80-100

## 导师能力等级说明

- `NOVICE` (新手): 综合评分 0-20
- `BEGINNER` (初级): 综合评分 20-40
- `INTERMEDIATE` (中级): 综合评分 40-60
- `ADVANCED` (高级): 综合评分 60-80
- `EXPERT` (专家): 综合评分 80-100
