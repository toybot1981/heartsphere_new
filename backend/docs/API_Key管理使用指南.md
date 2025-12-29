# API Key 管理使用指南

**文档版本**: v1.0  
**创建日期**: 2025-12-29

---

## 一、概述

API Key 功能允许外部业务系统通过 API Key 访问 AI 服务，无需先登录获取 JWT Token。管理员可以在管理后台创建、管理和监控 API Key。

---

## 二、API Key 格式

API Key 格式：`hs_` + 48位随机字符串（字母+数字）

示例：`hs_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz`

---

## 三、管理后台操作

### 3.1 创建 API Key

**接口**: `POST /api/admin/api-keys`

**请求头**:
```
Authorization: Bearer <admin-token>
```

**请求体**:
```json
{
  "keyName": "外部系统A",
  "userId": 123,
  "expiresAt": "2026-12-31T23:59:59",
  "rateLimit": 100,
  "description": "用于外部系统A的API Key"
}
```

**字段说明**:
- `keyName` (必填): API Key 名称
- `userId` (可选): 关联的用户ID，如果设置则使用该用户的配额
- `expiresAt` (可选): 过期时间
- `rateLimit` (可选): 速率限制（每分钟请求数）
- `description` (可选): 描述信息

**响应**:
```json
{
  "id": 1,
  "keyName": "外部系统A",
  "apiKey": "hs_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
  "userId": 123,
  "isActive": true,
  "expiresAt": "2026-12-31T23:59:59",
  "rateLimit": 100,
  "description": "用于外部系统A的API Key",
  "usageCount": 0,
  "createdAt": "2025-12-29T08:00:00"
}
```

**⚠️ 注意**: API Key 仅在创建时返回完整值，请务必保存。列表查询时只显示前8位。

### 3.2 查询所有 API Key

**接口**: `GET /api/admin/api-keys`

**响应**:
```json
[
  {
    "id": 1,
    "keyName": "外部系统A",
    "apiKey": "hs_abc12...",
    "userId": 123,
    "isActive": true,
    "expiresAt": "2026-12-31T23:59:59",
    "lastUsedAt": "2025-12-29T10:00:00",
    "usageCount": 150,
    "rateLimit": 100,
    "description": "用于外部系统A的API Key"
  }
]
```

### 3.3 启用/禁用 API Key

**接口**: `PUT /api/admin/api-keys/{id}/toggle?isActive=true`

### 3.4 删除 API Key

**接口**: `DELETE /api/admin/api-keys/{id}`

---

## 四、使用 API Key 调用 AI 服务

### 4.1 请求头格式

支持两种格式：

**方式1**: `Authorization: Bearer <api-key>`
```bash
curl -X POST http://localhost:8081/api/ai/text/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hs_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz" \
  -d '{
    "prompt": "你好，请介绍一下你自己",
    "temperature": 0.7,
    "maxTokens": 1000
  }'
```

**方式2**: `X-API-Key: <api-key>`
```bash
curl -X POST http://localhost:8081/api/ai/text/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: hs_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz" \
  -d '{
    "prompt": "你好，请介绍一下你自己",
    "temperature": 0.7,
    "maxTokens": 1000
  }'
```

### 4.2 Python 示例

```python
import requests

API_KEY = "hs_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
BASE_URL = "http://localhost:8081"

# 使用 Authorization 头
response = requests.post(
    f"{BASE_URL}/api/ai/text/generate",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "prompt": "你好，请介绍一下你自己",
        "temperature": 0.7,
        "maxTokens": 1000
    }
)

print(response.json())
```

### 4.3 Node.js 示例

```javascript
const axios = require('axios');

const API_KEY = 'hs_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz';
const BASE_URL = 'http://localhost:8081';

axios.post(
  `${BASE_URL}/api/ai/text/generate`,
  {
    prompt: '你好，请介绍一下你自己',
    temperature: 0.7,
    maxTokens: 1000
  },
  {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    }
  }
).then(response => {
  console.log(response.data);
});
```

---

## 五、认证优先级

系统按以下顺序尝试认证：

1. **JWT Token 认证**（如果请求头包含有效的 JWT Token）
2. **API Key 认证**（如果 JWT 认证失败或未提供 JWT Token）

如果两种认证都失败，返回 401 未授权错误。

---

## 六、API Key 验证规则

API Key 必须满足以下条件才能使用：

1. ✅ API Key 存在
2. ✅ API Key 已启用 (`isActive = true`)
3. ✅ API Key 未过期（如果设置了过期时间）

如果验证失败，会返回相应的错误信息。

---

## 七、使用记录

每次成功使用 API Key 调用服务时，系统会自动记录：
- 最后使用时间 (`lastUsedAt`)
- 使用次数 (`usageCount`)

管理员可以在管理后台查看这些统计信息。

---

## 八、安全建议

1. **保管好 API Key**：API Key 等同于密码，请妥善保管
2. **定期轮换**：建议定期更换 API Key
3. **设置过期时间**：为新创建的 API Key 设置合理的过期时间
4. **关联用户**：如果 API Key 用于特定用户，建议关联用户ID以便配额管理
5. **速率限制**：为 API Key 设置合理的速率限制，防止滥用
6. **及时禁用**：不再使用的 API Key 应及时禁用或删除

---

## 九、相关文档

- [AI服务外部访问指南.md](./AI服务外部访问指南.md) - 外部系统访问AI服务的完整指南
- [AIAgent服务接口文档.md](./AIAgent服务接口文档.md) - AI服务接口详细说明

---

**文档维护**: 如有功能变更，请及时更新本文档。

