# 阶段四和阶段五 API 文档

**版本**: v4.0 / v5.0  
**基础路径**: `/api/memory/v4` / `/api/memory/v5`  
**日期**: 2025-12-29

---

## 📋 目录

- [v4 API - 高级记忆能力](#v4-api---高级记忆能力)
- [v5 API - 记忆系统优化](#v5-api---记忆系统优化)
- [通用说明](#通用说明)
- [错误码说明](#错误码说明)

---

## v4 API - 高级记忆能力

### 1. 生成向量嵌入

**端点**: `POST /api/memory/v4/vector/embed`

**描述**: 为文本生成向量嵌入

**请求参数**:
- `text` (String, 必填): 文本内容

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "text": "测试文本",
    "embedding": [0.123, 0.456, ...],
    "dimension": 1536
  },
  "timestamp": "2025-12-29T10:00:00Z"
}
```

---

### 2. 向量语义搜索

**端点**: `POST /api/memory/v4/vector/search`

**描述**: 基于向量相似度搜索相似记忆

**请求体**:
```json
{
  "query": "查询文本",
  "userId": "user-1",
  "characterId": "character-1",
  "participantId": "participant-1",
  "limit": 10,
  "threshold": 0.6
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "memoryId": "memory-1",
      "memoryType": "PERSONAL_INFO",
      "content": "记忆内容",
      "similarity": 0.85,
      "userId": "user-1",
      "characterId": "character-1",
      "participantId": "participant-1"
    }
  ],
  "timestamp": "2025-12-29T10:00:00Z"
}
```

---

### 3. 获取记忆关联

**端点**: `GET /api/memory/v4/associations/{memoryId}`

**描述**: 获取指定记忆的关联记忆列表

**路径参数**:
- `memoryId` (String, 必填): 记忆ID

**查询参数**:
- `limit` (Integer, 可选, 默认10): 返回数量限制

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "assoc-1",
      "memoryId1": "memory-1",
      "memoryId2": "memory-2",
      "memoryType1": "PERSONAL_INFO",
      "memoryType2": "PREFERENCE",
      "associationType": "SEMANTIC",
      "strength": 0.8,
      "description": "语义相似"
    }
  ],
  "timestamp": "2025-12-29T10:00:00Z"
}
```

---

### 4. 发现记忆关联

**端点**: `POST /api/memory/v4/associations/discover`

**描述**: 自动发现记忆之间的关联关系

**请求参数**:
- `memoryId` (String, 必填): 记忆ID
- `limit` (Integer, 可选, 默认10): 返回数量限制

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "assoc-1",
      "memoryId1": "memory-1",
      "memoryId2": "memory-2",
      "strength": 0.75,
      "description": "语义相似"
    }
  ],
  "timestamp": "2025-12-29T10:00:00Z"
}
```

---

### 5. 智能检索

**端点**: `POST /api/memory/v4/intelligent/search`

**描述**: 多维度智能检索记忆（关键词、语义、关联）

**请求体**:
```json
{
  "query": "查询文本",
  "userId": "user-1",
  "characterId": "character-1",
  "participantId": "participant-1",
  "context": {
    "sessionId": "session-1"
  },
  "limit": 10
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "memoryId": "memory-1",
      "memoryType": "PERSONAL_INFO",
      "content": "记忆内容",
      "relevanceScore": 0.8,
      "importanceScore": 0.7,
      "recencyScore": 0.6,
      "finalScore": 0.73,
      "metadata": {}
    }
  ],
  "timestamp": "2025-12-29T10:00:00Z"
}
```

---

### 6. 混合检索

**端点**: `POST /api/memory/v4/intelligent/hybrid-search`

**描述**: 可配置权重的混合检索（关键词+语义+关联）

**请求体**:
```json
{
  "query": "查询文本",
  "userId": "user-1",
  "semanticWeight": 0.4,
  "keywordWeight": 0.4,
  "associationWeight": 0.2,
  "limit": 10
}
```

**响应示例**: 同智能检索

---

### 7. 执行记忆巩固

**端点**: `POST /api/memory/v4/consolidation/execute`

**描述**: 手动触发记忆巩固操作

**请求参数**:
- `userId` (String, 可选): 用户ID
- `memoryIds` (List<String>, 可选): 记忆ID列表（为空则批量巩固）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": "user-1",
    "consolidatedCount": 10,
    "message": "记忆巩固执行成功"
  },
  "timestamp": "2025-12-29T10:00:00Z"
}
```

---

### 8. 获取记忆巩固统计

**端点**: `GET /api/memory/v4/consolidation/stats`

**描述**: 获取记忆巩固的统计信息

**请求参数**:
- `userId` (String, 可选): 用户ID

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": "user-1",
    "message": "统计功能待实现"
  },
  "timestamp": "2025-12-29T10:00:00Z"
}
```

---

## v5 API - 记忆系统优化

### 1. 更新记忆衰减

**端点**: `POST /api/memory/v5/decay/update`

**描述**: 手动触发记忆衰减更新

**请求参数**:
- `userId` (String, 可选): 用户ID
- `characterId` (String, 可选): 角色ID
- `participantId` (String, 可选): 参与者ID

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": "user-1",
    "characterId": "character-1",
    "participantId": "participant-1",
    "updatedCount": 100,
    "message": "记忆衰减更新完成"
  },
  "timestamp": "2025-12-29T10:00:00Z"
}
```

---

### 2. 获取记忆衰减统计

**端点**: `GET /api/memory/v5/decay/stats`

**描述**: 获取记忆衰减的统计信息

**请求参数**:
- `userId` (String, 可选): 用户ID

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": "user-1",
    "message": "统计功能待实现"
  },
  "timestamp": "2025-12-29T10:00:00Z"
}
```

---

### 3. 缓存预热

**端点**: `POST /api/memory/v5/cache/warmup`

**描述**: 预热缓存，将热点数据加载到缓存

**请求参数**:
- `memoryIds` (List<String>, 可选): 记忆ID列表

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "memoryIds": ["memory-1", "memory-2"],
    "count": 2,
    "message": "缓存预热完成"
  },
  "timestamp": "2025-12-29T10:00:00Z"
}
```

---

### 4. 清理缓存

**端点**: `DELETE /api/memory/v5/cache/clear`

**描述**: 清理指定类型的缓存

**请求参数**:
- `cacheType` (String, 可选): 缓存类型（memory/vector/association，为空则清理所有）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "cacheType": "memory",
    "message": "缓存清理完成"
  },
  "timestamp": "2025-12-29T10:00:00Z"
}
```

---

### 5. 获取缓存统计

**端点**: `GET /api/memory/v5/cache/stats`

**描述**: 获取缓存使用统计信息

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "l1Size": 500,
    "l1HitCount": 1000,
    "l1MissCount": 200,
    "l1HitRate": 0.833,
    "l2Size": 5000,
    "l2HitCount": 5000,
    "l2MissCount": 1000,
    "l2HitRate": 0.833,
    "totalHitCount": 6000,
    "totalMissCount": 1200,
    "totalHitRate": 0.833
  },
  "timestamp": "2025-12-29T10:00:00Z"
}
```

---

### 6. 压缩记忆

**端点**: `POST /api/memory/v5/compression/compress`

**描述**: 压缩低频访问的记忆

**请求参数**:
- `memoryIds` (List<String>, 必填): 记忆ID列表

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "memoryIds": ["memory-1", "memory-2"],
    "compressedCount": 2,
    "results": [
      {
        "memoryId": "memory-1",
        "success": true,
        "originalSize": 1024,
        "compressedSize": 512,
        "compressionRatio": 0.5,
        "errorMessage": null
      }
    ]
  },
  "timestamp": "2025-12-29T10:00:00Z"
}
```

---

### 7. 归档记忆

**端点**: `POST /api/memory/v5/archiving/archive`

**描述**: 归档长期未使用的记忆

**请求参数**:
- `memoryIds` (List<String>, 必填): 记忆ID列表
- `reason` (String, 可选): 归档原因

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "memoryIds": ["memory-1", "memory-2"],
    "archivedCount": 2,
    "reason": "长期未使用",
    "results": [
      {
        "memoryId": "memory-1",
        "archivedMemoryId": "archived-1",
        "success": true,
        "errorMessage": null
      }
    ]
  },
  "timestamp": "2025-12-29T10:00:00Z"
}
```

---

### 8. 获取归档列表

**端点**: `GET /api/memory/v5/archiving/list`

**描述**: 获取已归档的记忆列表

**请求参数**:
- `userId` (String, 可选): 用户ID
- `page` (Integer, 可选, 默认0): 页码
- `size` (Integer, 可选, 默认20): 每页数量

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "memories": [
      {
        "id": "archived-1",
        "originalMemoryId": "memory-1",
        "userId": "user-1",
        "memoryType": "PERSONAL_INFO",
        "content": "记忆内容",
        "archivedAt": "2025-12-29T10:00:00Z",
        "archiveReason": "长期未使用"
      }
    ],
    "total": 100,
    "page": 0,
    "size": 20,
    "totalPages": 5
  },
  "timestamp": "2025-12-29T10:00:00Z"
}
```

---

### 9. 恢复归档记忆

**端点**: `POST /api/memory/v5/archiving/restore`

**描述**: 从归档中恢复记忆

**请求参数**:
- `archivedMemoryId` (String, 必填): 归档记忆ID

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "archivedMemoryId": "archived-1",
    "message": "恢复归档成功"
  },
  "timestamp": "2025-12-29T10:00:00Z"
}
```

---

### 10. 获取性能指标

**端点**: `GET /api/memory/v5/monitoring/metrics`

**描述**: 获取系统性能指标

**请求参数**:
- `startTime` (Long, 可选): 开始时间（时间戳）
- `endTime` (Long, 可选): 结束时间（时间戳）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "p50ResponseTime": 50.0,
    "p95ResponseTime": 150.0,
    "p99ResponseTime": 300.0,
    "qps": 100,
    "errorRate": 0.01,
    "cacheHitRate": 0.85,
    "operationCounts": {
      "search": 1000,
      "save": 500
    }
  },
  "timestamp": "2025-12-29T10:00:00Z"
}
```

---

### 11. 健康检查

**端点**: `GET /api/memory/v5/monitoring/health`

**描述**: 检查系统健康状态

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "status": "HEALTHY",
    "components": {
      "redis": {
        "status": "UP",
        "message": "正常"
      },
      "mongodb": {
        "status": "UP",
        "message": "正常"
      },
      "embedding": {
        "status": "UP",
        "message": "正常"
      }
    },
    "issues": []
  },
  "timestamp": "2025-12-29T10:00:00Z"
}
```

**状态码说明**:
- `200 OK`: 系统健康（HEALTHY）
- `200 OK`: 系统降级（DEGRADED）
- `503 Service Unavailable`: 系统不可用（DOWN）

---

### 12. 获取诊断信息

**端点**: `GET /api/memory/v5/monitoring/diagnostics`

**描述**: 获取系统诊断信息

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "health": {
      "status": "HEALTHY",
      "components": {},
      "issues": []
    },
    "performance": {
      "p50ResponseTime": 50.0,
      "p95ResponseTime": 150.0,
      "p99ResponseTime": 300.0,
      "qps": 100,
      "errorRate": 0.01,
      "cacheHitRate": 0.85
    },
    "storage": {
      "totalMemories": 10000,
      "totalSize": 104857600,
      "compressedSize": 52428800,
      "archivedCount": 1000,
      "compressionRatio": 0.5
    },
    "recommendations": [
      "缓存命中率较低，建议增加缓存预热",
      "压缩率较低，建议检查压缩策略"
    ]
  },
  "timestamp": "2025-12-29T10:00:00Z"
}
```

---

## 通用说明

### 认证

所有API端点需要JWT认证，在请求头中携带：
```
Authorization: Bearer <token>
```

### 响应格式

所有API响应遵循统一格式：
```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": "2025-12-29T10:00:00Z"
}
```

### 分页

分页参数：
- `page`: 页码（从0开始）
- `size`: 每页数量

分页响应：
```json
{
  "content": [],
  "total": 100,
  "page": 0,
  "size": 20,
  "totalPages": 5
}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 503 | 服务不可用 |

### 错误响应格式

```json
{
  "code": 400,
  "message": "请求参数错误: userId不能为空",
  "data": null,
  "timestamp": "2025-12-29T10:00:00Z"
}
```

---

## 📝 使用示例

### 示例1: 生成向量嵌入

```bash
curl -X POST "http://localhost:8081/api/memory/v4/vector/embed" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "text=测试文本"
```

### 示例2: 向量搜索

```bash
curl -X POST "http://localhost:8081/api/memory/v4/vector/search" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "用户偏好",
    "userId": "user-1",
    "limit": 10,
    "threshold": 0.6
  }'
```

### 示例3: 缓存预热

```bash
curl -X POST "http://localhost:8081/api/memory/v5/cache/warmup?memoryIds=memory-1&memoryIds=memory-2" \
  -H "Authorization: Bearer <token>"
```

### 示例4: 健康检查

```bash
curl -X GET "http://localhost:8081/api/memory/v5/monitoring/health" \
  -H "Authorization: Bearer <token>"
```

---

**文档版本**: v1.0  
**最后更新**: 2025-12-29



