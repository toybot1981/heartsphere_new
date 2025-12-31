# 心域连接模块API接口文档

**文档版本**: V1.0  
**编写日期**: 2025-12-28  
**基础URL**: `/api`

---

## 一、快速连接接口

### 1.1 获取快速连接列表

**接口**: `GET /api/quick-connect/characters`

**描述**: 获取用户的E-SOUL列表，支持筛选、排序、搜索、分页

**请求参数**:

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| filter | string | 否 | all | 筛选类型：all（全部）、favorite（收藏）、recent（最近）、scene（场景） |
| sceneId | number | 否 | - | 场景ID（当filter=scene时必填） |
| sortBy | string | 否 | frequency | 排序方式：frequency（频率）、recent（最近）、name（名称）、favorite（收藏优先） |
| limit | number | 否 | 50 | 返回数量限制 |
| offset | number | 否 | 0 | 偏移量（分页用） |
| search | string | 否 | - | 搜索关键词 |

**请求示例**:
```bash
GET /api/quick-connect/characters?filter=favorite&sortBy=recent&limit=20
```

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "characters": [
      {
        "characterId": 1,
        "characterName": "角色名称",
        "avatarUrl": "https://...",
        "sceneId": 1,
        "sceneName": "场景名称",
        "themeColor": "#3b82f6",
        "colorAccent": "#60a5fa",
        "bio": "角色简介",
        "tags": "标签1,标签2",
        "isFavorite": true,
        "lastAccessTime": 1703234567890,
        "accessCount": 15,
        "totalConversationTime": 3600,
        "recommendationScore": 0.85,
        "importance": 0.85
      }
    ],
    "totalCount": 50,
    "favoriteCount": 12,
    "recentCount": 8,
    "pagination": {
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  },
  "timestamp": "2025-12-28T10:00:00"
}
```

### 1.2 搜索E-SOUL

**接口**: `GET /api/quick-connect/search`

**描述**: 搜索E-SOUL，支持按名称、场景、标签、简介搜索

**请求参数**:

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| query | string | 是 | - | 搜索关键词 |
| filter | string | 否 | all | 筛选类型 |
| limit | number | 否 | 20 | 返回数量限制 |

**请求示例**:
```bash
GET /api/quick-connect/search?query=角色&filter=favorite
```

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "characters": [...],
    "totalCount": 5,
    "searchQuery": "角色",
    "highlightedFields": {}
  },
  "timestamp": "2025-12-28T10:00:00"
}
```

---

## 二、收藏接口

### 2.1 添加收藏

**接口**: `POST /api/favorites`

**描述**: 添加E-SOUL到收藏列表

**请求体**:
```json
{
  "characterId": 1,
  "sortOrder": 0
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "收藏成功",
  "data": {
    "id": 1,
    "userId": 1,
    "characterId": 1,
    "sortOrder": 0,
    "createdAt": "2025-12-28T10:00:00",
    "updatedAt": "2025-12-28T10:00:00"
  },
  "timestamp": "2025-12-28T10:00:00"
}
```

### 2.2 删除收藏

**接口**: `DELETE /api/favorites/{characterId}`

**描述**: 从收藏列表移除E-SOUL

**路径参数**:
- `characterId`: number - 角色ID

**响应示例**:
```json
{
  "code": 200,
  "message": "取消收藏成功",
  "data": null,
  "timestamp": "2025-12-28T10:00:00"
}
```

### 2.3 切换收藏状态

**接口**: `POST /api/favorites/toggle`

**描述**: 切换收藏状态（收藏/取消收藏）

**请求体**:
```json
{
  "characterId": 1,
  "sortOrder": 0
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "收藏成功",
  "data": {
    "id": 1,
    "userId": 1,
    "characterId": 1,
    "sortOrder": 0
  },
  "timestamp": "2025-12-28T10:00:00"
}
```

### 2.4 获取收藏列表

**接口**: `GET /api/favorites`

**描述**: 获取用户的收藏列表

**请求参数**:
- `sortBy`: string (可选) - 排序方式：created（创建时间）、sortOrder（排序顺序）、access（访问时间）

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "characterId": 1,
      "sortOrder": 0,
      "createdAt": "2025-12-28T10:00:00",
      "character": {...}
    }
  ],
  "timestamp": "2025-12-28T10:00:00"
}
```

### 2.5 检查收藏状态

**接口**: `GET /api/favorites/check/{characterId}`

**描述**: 检查是否已收藏某个E-SOUL

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": true,
  "timestamp": "2025-12-28T10:00:00"
}
```

### 2.6 获取收藏数量

**接口**: `GET /api/favorites/count`

**描述**: 获取用户的收藏数量

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": 12,
  "timestamp": "2025-12-28T10:00:00"
}
```

### 2.7 调整收藏顺序

**接口**: `PUT /api/favorites/reorder`

**描述**: 调整收藏列表的排序

**请求体**:
```json
[
  {"characterId": 1, "sortOrder": 0},
  {"characterId": 2, "sortOrder": 1}
]
```

**响应示例**:
```json
{
  "code": 200,
  "message": "排序更新成功",
  "data": null,
  "timestamp": "2025-12-28T10:00:00"
}
```

---

## 三、访问历史接口

### 3.1 记录访问历史

**接口**: `POST /api/access-history`

**描述**: 记录用户访问E-SOUL的历史

**请求体**:
```json
{
  "characterId": 1,
  "accessDuration": 3600,
  "conversationRounds": 10,
  "sessionId": "session_123"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "访问历史记录成功",
  "data": {
    "id": 1,
    "userId": 1,
    "characterId": 1,
    "accessTime": "2025-12-28T10:00:00",
    "accessDuration": 3600,
    "conversationRounds": 10,
    "sessionId": "session_123"
  },
  "timestamp": "2025-12-28T10:00:00"
}
```

### 3.2 获取访问历史

**接口**: `GET /api/access-history`

**描述**: 获取用户的访问历史

**请求参数**:
- `characterId`: number (可选) - 角色ID（筛选特定角色）
- `limit`: number (可选) - 返回数量（默认20）

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "characterId": 1,
      "accessTime": "2025-12-28T10:00:00",
      "accessDuration": 3600,
      "conversationRounds": 10
    }
  ],
  "timestamp": "2025-12-28T10:00:00"
}
```

### 3.3 获取访问统计

**接口**: `GET /api/access-history/statistics/{characterId}`

**描述**: 获取用户对特定E-SOUL的访问统计

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "userId": 1,
    "characterId": 1,
    "accessCount": 15,
    "lastAccessTime": "2025-12-28T10:00:00",
    "totalDuration": 18000,
    "totalConversationRounds": 100
  },
  "timestamp": "2025-12-28T10:00:00"
}
```

### 3.4 获取最近访问的角色

**接口**: `GET /api/access-history/recent`

**描述**: 获取用户最近访问的角色ID列表

**请求参数**:
- `limit`: number (可选) - 返回数量（默认10）

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [1, 2, 3, 4, 5],
  "timestamp": "2025-12-28T10:00:00"
}
```

---

## 四、错误响应

### 4.1 错误响应格式

```json
{
  "code": 400,
  "message": "参数错误：characterId不能为空",
  "data": null,
  "timestamp": "2025-12-28T10:00:00"
}
```

### 4.2 常见错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误 |
| 401 | 未授权（需要登录） |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如重复收藏） |
| 500 | 服务器内部错误 |

---

## 五、认证

所有接口都需要JWT认证，在请求头中传递：

```
Authorization: Bearer <token>
```

---

## 六、使用示例

### 6.1 获取收藏列表

```bash
curl -X GET "http://localhost:8081/api/favorites" \
  -H "Authorization: Bearer <token>"
```

### 6.2 添加收藏

```bash
curl -X POST "http://localhost:8081/api/favorites" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"characterId": 1, "sortOrder": 0}'
```

### 6.3 搜索E-SOUL

```bash
curl -X GET "http://localhost:8081/api/quick-connect/search?query=角色" \
  -H "Authorization: Bearer <token>"
```

---

**文档维护**: 如有API变更，请及时更新本文档



