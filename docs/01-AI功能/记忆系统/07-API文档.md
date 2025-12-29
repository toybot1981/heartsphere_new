# 记忆系统 API 文档

**文档版本**: V1.0  
**编写日期**: 2025-12-28  
**基础URL**: `/api/memory`

---

## 一、API概览

### 1.1 API版本

- **v1**: 基础记忆系统（阶段一）
- **v2**: 角色记忆系统（阶段二）
- **v3**: 参与者记忆系统（阶段三）
- **v4**: 高级记忆能力（阶段四）

### 1.2 认证

所有API请求需要在Header中包含认证信息：

```
Authorization: Bearer {token}
```

### 1.3 响应格式

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

**错误响应**：
```json
{
  "code": 400,
  "message": "错误描述",
  "error": "详细错误信息"
}
```

---

## 二、基础记忆系统 API (v1)

### 2.1 短期记忆

#### 2.1.1 保存消息

```
POST /api/memory/v1/sessions/{sessionId}/messages
```

**请求体**：
```json
{
  "role": "USER",
  "content": "你好，我叫张三",
  "metadata": {}
}
```

**响应**：
```json
{
  "code": 201,
  "message": "success",
  "data": {
    "id": "msg-123",
    "sessionId": "session-456",
    "role": "USER",
    "content": "你好，我叫张三",
    "timestamp": 1703683200000
  }
}
```

#### 2.1.2 获取消息

```
GET /api/memory/v1/sessions/{sessionId}/messages?limit=20
```

**响应**：
```json
{
  "code": 200,
  "data": {
    "messages": [
      {
        "id": "msg-123",
        "role": "USER",
        "content": "你好，我叫张三",
        "timestamp": 1703683200000
      }
    ],
    "total": 1
  }
}
```

### 2.2 长期记忆

#### 2.2.1 保存用户事实

```
POST /api/memory/v1/users/{userId}/facts
```

**请求体**：
```json
{
  "fact": "名字: 张三",
  "category": "PERSONAL",
  "importance": 0.9,
  "confidence": 0.8,
  "tags": ["基本信息"]
}
```

**响应**：
```json
{
  "code": 201,
  "data": {
    "id": "fact-123",
    "userId": "user-456",
    "fact": "名字: 张三",
    "category": "PERSONAL",
    "createdAt": "2025-12-28T10:00:00Z"
  }
}
```

#### 2.2.2 搜索用户事实

```
GET /api/memory/v1/users/{userId}/facts/search?query=张三&limit=10
```

**响应**：
```json
{
  "code": 200,
  "data": {
    "facts": [
      {
        "id": "fact-123",
        "fact": "名字: 张三",
        "category": "PERSONAL",
        "importance": 0.9
      }
    ],
    "total": 1
  }
}
```

#### 2.2.3 保存用户偏好

```
POST /api/memory/v1/users/{userId}/preferences
```

**请求体**：
```json
{
  "key": "language",
  "value": "zh-CN",
  "type": "STRING",
  "confidence": 0.9
}
```

#### 2.2.4 获取用户偏好

```
GET /api/memory/v1/users/{userId}/preferences/{key}
```

**响应**：
```json
{
  "code": 200,
  "data": {
    "id": "pref-123",
    "userId": "user-456",
    "key": "language",
    "value": "zh-CN",
    "type": "STRING",
    "updatedAt": "2025-12-28T10:00:00Z"
  }
}
```

### 2.3 记忆提取

#### 2.3.1 从会话提取记忆

```
POST /api/memory/v1/users/{userId}/sessions/{sessionId}/extract
```

**响应**：
```json
{
  "code": 200,
  "data": {
    "extractedFacts": 5,
    "extractedPreferences": 2,
    "facts": [
      {
        "id": "fact-123",
        "fact": "名字: 张三",
        "category": "PERSONAL",
        "confidence": 0.9
      }
    ]
  }
}
```

---

## 三、角色记忆系统 API (v2)

### 3.1 角色自身记忆

#### 3.1.1 保存角色自身记忆

**接口**: `POST /api/memory/v2/characters/{characterId}/self-memories`

**请求体**：
```json
{
  "type": "PERSONALITY",
  "importance": "IMPORTANT",
  "content": "性格温和，喜欢帮助他人",
  "structuredData": {
    "personality": "温和",
    "trait": "助人为乐"
  },
  "tags": ["性格", "特点"],
  "confidence": 0.9
}
```

**响应**：
```json
{
  "code": 201,
  "message": "操作成功",
  "data": {
    "id": "cmem-123",
    "characterId": "char-456",
    "type": "PERSONALITY",
    "importance": "IMPORTANT",
    "content": "性格温和，喜欢帮助他人",
    "createdAt": "2025-12-29T10:00:00Z"
  }
}
```

#### 3.1.2 获取角色自身记忆

**接口**: `GET /api/memory/v2/characters/{characterId}/self-memories?type={type}`

**查询参数**:
- `type` (可选): 记忆类型，如 `PERSONALITY`, `BACKGROUND`, `EXPERIENCE`

**响应**：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "memories": [
      {
        "id": "cmem-123",
        "type": "PERSONALITY",
        "content": "性格温和，喜欢帮助他人",
        "importance": "IMPORTANT",
        "createdAt": "2025-12-29T10:00:00Z"
      }
    ],
    "total": 1
  }
}
```

### 3.2 角色交互记忆

#### 3.2.1 保存角色交互记忆

**接口**: `POST /api/memory/v2/characters/{characterId}/interaction-memories`

**请求体**：
```json
{
  "eraId": "era-001",
  "type": "CONVERSATION_TOPIC",
  "importance": "NORMAL",
  "content": "用户喜欢谈论旅行话题",
  "interactionType": "CONVERSATION",
  "userRelatedData": {
    "preference": "旅行"
  },
  "confidence": 0.8
}
```

**说明**: `userId` 会自动从认证信息中获取

**响应**：
```json
{
  "code": 201,
  "message": "操作成功",
  "data": {
    "id": "imem-123",
    "characterId": "char-456",
    "userId": "user-789",
    "eraId": "era-001",
    "content": "用户喜欢谈论旅行话题",
    "interactionTime": "2025-12-29T10:00:00Z"
  }
}
```

#### 3.2.2 获取角色交互记忆

**接口**: `GET /api/memory/v2/characters/{characterId}/interaction-memories?eraId={eraId}`

**查询参数**:
- `eraId` (可选): 场景ID，如果提供则只返回该场景中的交互记忆

**说明**: `userId` 会自动从认证信息中获取

**响应**：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "memories": [
      {
        "id": "imem-123",
        "userId": "user-789",
        "content": "用户喜欢谈论旅行话题",
        "interactionTime": "2025-12-29T10:00:00Z",
        "type": "CONVERSATION_TOPIC"
      }
    ],
    "total": 1
  }
}
```

### 3.3 角色场景记忆

#### 3.3.1 保存角色场景记忆

**接口**: `POST /api/memory/v2/characters/{characterId}/scene-memories`

**请求体**：
```json
{
  "eraId": "era-001",
  "type": "CONVERSATION_TOPIC",
  "importance": "NORMAL",
  "content": "在大学场景中，角色是学生",
  "sceneContext": "大学场景",
  "inheritable": false,
  "confidence": 0.8
}
```

**响应**：
```json
{
  "code": 201,
  "message": "操作成功",
  "data": {
    "id": "smem-123",
    "characterId": "char-456",
    "eraId": "era-001",
    "content": "在大学场景中，角色是学生",
    "createdAt": "2025-12-29T10:00:00Z"
  }
}
```

#### 3.3.2 获取角色场景记忆

**接口**: `GET /api/memory/v2/characters/{characterId}/scene-memories?eraId={eraId}`

**查询参数**:
- `eraId` (可选): 场景ID，如果提供则只返回该场景中的记忆

**响应**：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "memories": [
      {
        "id": "smem-123",
        "eraId": "era-001",
        "content": "在大学场景中，角色是学生",
        "createdAt": "2025-12-29T10:00:00Z"
      }
    ],
    "total": 1
  }
}
```

### 3.4 角色关系记忆

#### 3.4.1 保存或更新角色关系

**接口**: `POST /api/memory/v2/characters/{characterId}/relationships`

**请求体**：
```json
{
  "relatedCharacterId": "char-789",
  "relationshipType": "FRIEND",
  "strength": 0.8,
  "description": "好朋友"
}
```

**响应**：
```json
{
  "code": 201,
  "message": "操作成功",
  "data": {
    "id": "rel-123",
    "characterId": "char-456",
    "relatedCharacterId": "char-789",
    "relationshipType": "FRIEND",
    "strength": 0.8,
    "description": "好朋友",
    "createdAt": "2025-12-29T10:00:00Z"
  }
}
```

#### 3.4.2 获取角色所有关系

**接口**: `GET /api/memory/v2/characters/{characterId}/relationships?relationshipType={type}`

**查询参数**:
- `relationshipType` (可选): 关系类型，如 `FRIEND`, `FAMILY`, `ENEMY` 等

**响应**：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "relationships": [
      {
        "id": "rel-123",
        "relatedCharacterId": "char-789",
        "relationshipType": "FRIEND",
        "strength": 0.8,
        "description": "好朋友",
        "lastInteractedAt": "2025-12-29T10:00:00Z"
      }
    ],
    "total": 1
  }
}
```

#### 3.4.3 更新关系强度

**接口**: `PUT /api/memory/v2/characters/{characterId}/relationships/{relatedCharacterId}/strength?strength={strength}`

**路径参数**:
- `characterId`: 角色ID
- `relatedCharacterId`: 关联角色ID

**查询参数**:
- `strength`: 关系强度 (0.0-1.0)

**响应**：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": "rel-123",
    "strength": 0.9,
    "relationshipHistory": [
      {
        "oldStrength": 0.8,
        "newStrength": 0.9,
        "timestamp": "2025-12-29T10:00:00Z"
      }
    ]
  }
}
```

**请求体**：
```json
{
  "relatedCharacterId": "char-789",
  "relationshipType": "FRIEND",
  "strength": 0.8,
  "description": "好朋友"
}
```

#### 3.4.2 获取角色所有关系

```
GET /api/memory/v2/characters/{characterId}/relationships
```

### 3.5 角色记忆检索

#### 3.5.1 检索相关记忆

```
POST /api/memory/v2/characters/{characterId}/memories/search
```

**请求体**：
```json
{
  "query": "用户偏好",
  "limit": 10,
  "memoryTypes": ["INTERACTION_MEMORY", "SCENE_MEMORY"]
}
```

---

## 四、参与者记忆系统 API (v3)

### 4.1 参与者交互记忆

#### 4.1.1 保存交互记忆

```
POST /api/memory/v3/participants/{participantId}/interaction-memories
```

**请求体**：
```json
{
  "relatedParticipantId": "part-789",
  "sceneId": "scene-001",
  "type": "COLLABORATION",
  "importance": "NORMAL",
  "content": "与参与者part-789协作完成了任务A",
  "interactionType": "COLLABORATION",
  "collaborationType": "TASK_COLLABORATION",
  "collaborationResult": "SUCCESS"
}
```

#### 4.1.2 获取交互记忆

```
GET /api/memory/v3/participants/{participantId}/interaction-memories?relatedParticipantId={relatedId}&sceneId={sceneId}
```

### 4.2 参与者关系

#### 4.2.1 保存或更新关系

```
POST /api/memory/v3/participants/{participantId}/relationships
```

**请求体**：
```json
{
  "relatedParticipantId": "part-789",
  "sceneId": "scene-001",
  "relationshipType": "COLLEAGUE",
  "strength": 0.7,
  "description": "工作伙伴"
}
```

#### 4.2.2 获取关系网络

```
GET /api/memory/v3/participants/{participantId}/relationship-network?maxDepth=2
```

**响应**：
```json
{
  "code": 200,
  "data": {
    "participantId": "part-456",
    "nodes": [
      {
        "participantId": "part-456",
        "identity": "用户A"
      },
      {
        "participantId": "part-789",
        "identity": "用户B"
      }
    ],
    "edges": [
      {
        "fromParticipantId": "part-456",
        "toParticipantId": "part-789",
        "relationshipType": "COLLEAGUE",
        "strength": 0.7
      }
    ],
    "maxDepth": 2,
    "generatedAt": "2025-12-28T10:00:00Z"
  }
}
```

### 4.3 参与者偏好

#### 4.3.1 保存偏好

```
POST /api/memory/v3/participants/{participantId}/preferences
```

**请求体**：
```json
{
  "sceneId": "scene-001",
  "key": "interactionStyle",
  "value": "collaborative",
  "type": "STRING",
  "confidence": 0.8
}
```

---

## 五、高级记忆能力 API (v4)

### 5.1 语义搜索

#### 5.1.1 语义搜索

```
POST /api/memory/v4/search/semantic
```

**请求体**：
```json
{
  "userId": "user-456",
  "query": "用户喜欢喝咖啡",
  "limit": 10,
  "threshold": 0.7
}
```

**响应**：
```json
{
  "code": 200,
  "data": {
    "results": [
      {
        "memoryId": "mem-123",
        "similarity": 0.85,
        "content": "用户喜欢喝拿铁咖啡",
        "type": "PREFERENCE"
      }
    ],
    "total": 1
  }
}
```

### 5.2 记忆关联

#### 5.2.1 获取记忆关联

```
GET /api/memory/v4/memories/{memoryId}/associations?limit=20
```

**响应**：
```json
{
  "code": 200,
  "data": {
    "associations": [
      {
        "id": "assoc-123",
        "toMemoryId": "mem-789",
        "type": "SEMANTIC",
        "strength": 0.8,
        "description": "语义相似"
      }
    ],
    "total": 1
  }
}
```

#### 5.2.2 基于关联检索

```
GET /api/memory/v4/memories/{memoryId}/retrieve-by-association?limit=10&minStrength=0.6
```

### 5.3 记忆巩固

#### 5.3.1 手动巩固记忆

```
POST /api/memory/v4/memories/{memoryId}/consolidate
```

**响应**：
```json
{
  "code": 200,
  "data": {
    "success": true,
    "importance": 0.85,
    "consolidated": true
  }
}
```

#### 5.3.2 批量巩固

```
POST /api/memory/v4/users/{userId}/consolidate
```

**请求体**：
```json
{
  "memoryIds": ["mem-123", "mem-456"],
  "auto": true
}
```

**响应**：
```json
{
  "code": 200,
  "data": {
    "consolidatedCount": 2,
    "skippedCount": 0
  }
}
```

---

## 六、错误码

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 七、限流

- **默认限流**：1000 requests/minute
- **批量操作**：100 requests/minute
- **搜索操作**：500 requests/minute

---

## 八、版本兼容性

- API版本向后兼容
- 新版本API不会破坏旧版本功能
- 废弃的API会在文档中标注，并在3个版本周期后移除

