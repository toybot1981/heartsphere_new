# 多智能体协作 API 参考

## 概述

多智能体协作 API 提供 RESTful 接口，支持创建、查询、执行和取消多智能体协作任务。

## 基础路径

```
/api/multi-agent
```

## 认证

所有 API 请求需要 JWT 认证：

```
Authorization: Bearer <token>
```

## API 端点

### 1. 创建协作请求

**POST** `/api/multi-agent/collaborate`

创建新的多智能体协作任务。

**请求体**:
```json
{
  "request": "我想提高工作效率，同时保持健康的生活方式",
  "sessionId": "session-123"
}
```

**响应**:
```json
{
  "collaborationId": "collab-1234567890-abc",
  "status": "running",
  "message": "协作已启动"
}
```

**状态码**:
- `200 OK` - 协作已创建
- `400 Bad Request` - 请求参数错误
- `401 Unauthorized` - 未认证
- `500 Internal Server Error` - 服务器错误

### 2. 获取协作状态

**GET** `/api/multi-agent/collaboration/{collaborationId}/status`

获取协作任务的当前状态。

**路径参数**:
- `collaborationId` - 协作任务 ID

**响应**:
```json
{
  "collaborationId": "collab-1234567890-abc",
  "status": "RUNNING"
}
```

**状态值**:
- `PENDING` - 等待执行
- `RUNNING` - 执行中
- `COMPLETED` - 已完成
- `FAILED` - 失败
- `CANCELLED` - 已取消

**状态码**:
- `200 OK` - 成功
- `404 Not Found` - 协作不存在
- `401 Unauthorized` - 未认证

### 3. 执行协作（获取结果）

**POST** `/api/multi-agent/collaboration/{collaborationId}/execute`

执行协作任务并获取结果。

**路径参数**:
- `collaborationId` - 协作任务 ID

**响应**:
```json
{
  "collaborationId": "collab-1234567890-abc",
  "success": true,
  "result": "整合后的结果文本...",
  "agentResults": {
    "shixiaoguang": "时小光的执行结果",
    "kangxiaojian": "康小健的执行结果"
  },
  "errors": []
}
```

**状态码**:
- `200 OK` - 成功
- `404 Not Found` - 协作不存在
- `401 Unauthorized` - 未认证
- `500 Internal Server Error` - 执行失败

### 4. 取消协作

**DELETE** `/api/multi-agent/collaboration/{collaborationId}`

取消正在执行的协作任务。

**路径参数**:
- `collaborationId` - 协作任务 ID

**响应**:
```json
{
  "collaborationId": "collab-1234567890-abc",
  "status": "cancelled",
  "message": "协作已取消"
}
```

**状态码**:
- `200 OK` - 成功
- `404 Not Found` - 协作不存在
- `401 Unauthorized` - 未认证

## 使用示例

### JavaScript/TypeScript

```typescript
import { multiAgentApi } from './services/api/multiAgentApi';

// 创建协作
const response = await multiAgentApi.collaborate({
  request: "我想提高工作效率，同时保持健康的生活方式",
  sessionId: "session-123"
});

const collaborationId = response.collaborationId;

// 轮询状态
const interval = setInterval(async () => {
  const status = await multiAgentApi.getStatus(collaborationId);
  if (status.status === 'COMPLETED') {
    clearInterval(interval);
    const result = await multiAgentApi.execute(collaborationId);
    console.log('协作结果:', result);
  }
}, 1000);
```

### cURL

```bash
# 创建协作
COLLAB_ID=$(curl -X POST http://localhost:8080/api/multi-agent/collaborate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "request": "我想提高工作效率",
    "sessionId": "session-123"
  }' | jq -r '.collaborationId')

# 查询状态
curl http://localhost:8080/api/multi-agent/collaboration/$COLLAB_ID/status \
  -H "Authorization: Bearer $TOKEN"

# 获取结果
curl -X POST http://localhost:8080/api/multi-agent/collaboration/$COLLAB_ID/execute \
  -H "Authorization: Bearer $TOKEN"
```

## 错误处理

所有 API 在错误时返回标准错误格式：

```json
{
  "error": "错误消息",
  "code": "ERROR_CODE",
  "timestamp": "2026-01-16T12:00:00Z"
}
```

常见错误码：
- `INVALID_REQUEST` - 请求参数无效
- `COLLABORATION_NOT_FOUND` - 协作不存在
- `COLLABORATION_ALREADY_COMPLETED` - 协作已完成
- `UNAUTHORIZED` - 未认证
- `INTERNAL_ERROR` - 服务器内部错误

## 限流

API 请求限制：
- 每个用户每分钟最多 10 个协作请求
- 每个会话最多同时运行 3 个协作任务

## 最佳实践

1. **异步处理**: 协作是异步的，使用轮询或 WebSocket 获取状态
2. **错误重试**: 实现指数退避重试机制
3. **超时处理**: 设置合理的超时时间
4. **结果缓存**: 对于相同请求，可以缓存结果
