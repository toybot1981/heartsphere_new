# 能力体系 API 文档

## 概述

能力体系API提供角色能力管理、评估、成长和可视化功能，整合了导师能力和挚友能力到统一的能力体系。

**Base URL**: `/api/capability/v1/character`

## API端点

### 1. 能力档案管理

#### 获取角色能力档案
```
GET /{characterId}/profile
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "characterId": 123,
    "skillDimensionScore": 75,
    "memoryDimensionScore": 80,
    "consciousnessDimensionScore": 70,
    "collaborationDimensionScore": 65,
    "relationshipDimensionScore": 85,
    "mentorshipCapabilityScore": 80,
    "companionshipCapabilityScore": 90,
    "overallScore": 75
  }
}
```

### 2. 关系维度整合

#### 整合关系维度能力
```
POST /{characterId}/relationship/integrate?userId={userId}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "characterId": 123,
    "mentorshipScore": 80,
    "companionshipScore": 90,
    "relationshipScore": 85,
    "mentorshipDetails": {...},
    "companionshipDetails": {...}
  }
}
```

### 3. 能力经验值

#### 获取能力经验值
```
GET /{characterId}/experience
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "characterId": 123,
    "skillExperience": 5000,
    "memoryExperience": 6000,
    "consciousnessExperience": 4000,
    "collaborationExperience": 3000,
    "relationshipExperience": 8000,
    "mentorshipExperience": 5000,
    "companionshipExperience": 3000,
    "totalExperience": 34000
  }
}
```

### 4. 能力等级

#### 获取能力等级
```
GET /{characterId}/levels
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "skill": 5,
    "memory": 6,
    "consciousness": 4,
    "relationship": 8,
    "mentorship": 5,
    "companionship": 3,
    "overall": 5
  }
}
```

### 5. 成长事件同步

#### 同步成长事件
```
POST /{characterId}/sync-growth-events?userId={userId}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": 42
}
```

### 6. 能力评估

#### 评估关系维度能力
```
POST /{characterId}/relationship/assess?userId={userId}
```

#### 全面能力评估
```
POST /{characterId}/assess?userId={userId}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "characterId": 123,
    "skillScore": 75,
    "memoryScore": 80,
    "consciousnessScore": 70,
    "collaborationScore": 65,
    "relationshipScore": 85,
    "mentorshipScore": 80,
    "companionshipScore": 90,
    "overallScore": 75
  }
}
```

### 7. 能力优化

#### 生成能力优化建议
```
GET /{characterId}/optimization-suggestions
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "dimension": "SKILL",
      "type": "BOTTLENECK",
      "priority": "HIGH",
      "title": "技能维度需要提升",
      "description": "技能维度得分低于平均水平",
      "suggestedActions": ["增加技能使用频率", "提升技能执行成功率"]
    }
  ]
}
```

### 8. 能力协同

#### 查询能力协同历史
```
GET /{characterId}/synergy/history?page=0&size=20
```

#### 查询指定类型的协同日志
```
GET /{characterId}/synergy/type/{synergyType}
```

#### 统计能力协同效果
```
GET /{characterId}/synergy/statistics
```

#### 触发关系-技能协同
```
POST /{characterId}/synergy/relationship-skill?userId={userId}&skillId={skillId}&skillType={skillType}
```

### 9. 能力个性化

#### 能力个性化
```
POST /{characterId}/personalize?userId={userId}
```

#### 获取能力发展建议
```
GET /{characterId}/development-suggestions?userId={userId}
```

#### 推荐能力组合
```
GET /{characterId}/combination/recommend?userId={userId}&scenario={scenario}
```

#### 评估能力组合效果
```
POST /{characterId}/combination/evaluate
Body: CapabilityCombinationDTO
```

### 10. 能力可视化

#### 获取能力雷达图数据
```
GET /{characterId}/visualization/radar
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "characterId": 123,
    "dimensions": [
      {
        "name": "技能",
        "code": "SKILL",
        "score": 75,
        "maxScore": 100
      },
      {
        "name": "关系",
        "code": "RELATIONSHIP",
        "score": 85,
        "maxScore": 100,
        "subDimensions": [
          {
            "name": "导师能力",
            "code": "MENTORSHIP",
            "score": 80
          },
          {
            "name": "挚友能力",
            "code": "COMPANIONSHIP",
            "score": 90
          }
        ]
      }
    ],
    "overallScore": 75
  }
}
```

#### 获取能力成长轨迹数据
```
GET /{characterId}/visualization/growth-trajectory?userId={userId}
```

#### 获取能力使用统计数据
```
GET /{characterId}/visualization/usage-statistics
```

#### 获取关系-能力协同可视化数据
```
GET /{characterId}/visualization/synergy?userId={userId}
```

## 错误响应

所有API在出错时返回以下格式：

```json
{
  "code": 500,
  "message": "错误描述",
  "data": null
}
```

## 认证

所有API需要JWT认证，在请求头中携带：
```
Authorization: Bearer {token}
```
