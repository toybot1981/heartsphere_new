# AI服务外部访问指南

**文档版本**: v1.0  
**创建日期**: 2025-12-29  
**适用范围**: 外部业务系统调用AI服务

---

## 一、概述

AI服务提供了统一的HTTP接口供外部业务系统调用，当前支持以下认证方式：
1. **JWT认证**（已实现）：需要用户登录获取token
2. **API Key认证**（推荐用于外部系统）：通过API Key进行认证（待实现）

---

## 二、当前实现：JWT认证方式

### 2.1 接口地址

- **基础URL**: `http://localhost:8081/api/ai`
- **CORS**: 已配置，允许所有来源 (`@CrossOrigin(origins = "*")`)

### 2.2 认证流程

1. **获取JWT Token**
   ```bash
   curl -X POST http://localhost:8081/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "username": "your-email@example.com",
       "password": "your-password"
     }'
   ```

   响应示例：
   ```json
   {
     "code": 200,
     "message": "登录成功",
     "data": {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     }
   }
   ```

2. **使用Token调用AI服务**
   ```bash
   curl -X POST http://localhost:8081/api/ai/text/generate \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <your-token>" \
     -d '{
       "prompt": "你好，请介绍一下你自己",
       "temperature": 0.7,
       "maxTokens": 1000
     }'
   ```

### 2.3 可用接口

详见 [AIAgent服务接口文档.md](./AIAgent服务接口文档.md)

主要接口：
- `POST /api/ai/text/generate` - 文本生成
- `POST /api/ai/text/generate/stream` - 流式文本生成
- `POST /api/ai/image/generate` - 图片生成
- `POST /api/ai/audio/tts` - 文本转语音
- `POST /api/ai/audio/stt` - 语音转文本
- `POST /api/ai/video/generate` - 视频生成
- `POST /api/ai/v1/chat/completions` - OpenAPI兼容接口

---

## 三、推荐方案：API Key认证（待实现）

对于外部业务系统，推荐使用API Key认证方式，更安全和方便。

### 3.1 设计方案

**请求头格式**：
```
Authorization: Bearer <api-key>
或
X-API-Key: <api-key>
```

**实现思路**：
1. 创建API Key表，存储API Key与用户/应用的关联关系
2. 创建API Key认证过滤器，在JWT认证之后执行
3. 如果JWT认证失败，尝试API Key认证
4. 支持API Key的创建、删除、启用/禁用功能

### 3.2 使用示例（设计）

```bash
curl -X POST http://localhost:8081/api/ai/text/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{
    "prompt": "你好，请介绍一下你自己",
    "temperature": 0.7,
    "maxTokens": 1000
  }'
```

---

## 四、快速开始（当前方案）

### 4.1 完整示例

**步骤1：登录获取Token**
```bash
TOKEN=$(curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"password123"}' \
  | jq -r '.data.token')

echo "Token: $TOKEN"
```

**步骤2：调用AI服务**
```bash
curl -X POST http://localhost:8081/api/ai/text/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "你好，请介绍一下你自己",
    "provider": "dashscope",
    "model": "qwen-max",
    "temperature": 0.7,
    "maxTokens": 1000
  }' | jq .
```

**步骤3：流式调用**
```bash
curl -X POST http://localhost:8081/api/ai/text/generate/stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "写一篇关于人工智能的短文",
    "temperature": 0.7,
    "maxTokens": 2000,
    "stream": true
  }' \
  --no-buffer
```

### 4.2 Python示例

```python
import requests
import json

# 1. 登录获取Token
login_url = "http://localhost:8081/api/auth/login"
login_data = {
    "username": "test@example.com",
    "password": "password123"
}

response = requests.post(login_url, json=login_data)
token = response.json()["data"]["token"]

# 2. 调用AI服务
ai_url = "http://localhost:8081/api/ai/text/generate"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}
ai_data = {
    "prompt": "你好，请介绍一下你自己",
    "temperature": 0.7,
    "maxTokens": 1000
}

response = requests.post(ai_url, headers=headers, json=ai_data)
result = response.json()
print(json.dumps(result, indent=2, ensure_ascii=False))
```

### 4.3 Node.js示例

```javascript
const axios = require('axios');

async function callAIService() {
  try {
    // 1. 登录获取Token
    const loginResponse = await axios.post('http://localhost:8081/api/auth/login', {
      username: 'test@example.com',
      password: 'password123'
    });
    const token = loginResponse.data.data.token;

    // 2. 调用AI服务
    const aiResponse = await axios.post(
      'http://localhost:8081/api/ai/text/generate',
      {
        prompt: '你好，请介绍一下你自己',
        temperature: 0.7,
        maxTokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(JSON.stringify(aiResponse.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

callAIService();
```

---

## 五、注意事项

### 5.1 认证要求

- 当前所有接口都需要JWT认证
- Token需要在 `Authorization` 请求头中以 `Bearer <token>` 格式传递
- Token有效期由JWT配置决定（默认7天）

### 5.2 CORS配置

- 已配置允许所有来源（`@CrossOrigin(origins = "*")`）
- 支持所有HTTP方法（GET, POST, PUT, DELETE等）
- 允许所有请求头

### 5.3 错误处理

常见错误码：
- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权（token无效或过期）
- `500`: 服务器内部错误

错误响应示例：
```json
{
  "code": 401,
  "message": "未授权：请重新登录",
  "timestamp": "2025-12-29T08:00:00"
}
```

### 5.4 限流和配额

- 系统会自动进行配额检查和计费
- 如果用户配额不足，会返回 `QuotaInsufficientException`
- 建议在生产环境中添加限流机制

---

## 六、后续改进建议

1. **API Key认证**：添加API Key认证支持，更适合外部系统集成
2. **限流机制**：添加请求限流，防止滥用
3. **API文档**：集成Swagger UI，提供在线API文档
4. **Webhook支持**：对于异步任务，支持Webhook回调
5. **API版本管理**：添加API版本控制（如 `/api/v1/ai`）

---

## 七、相关文档

- [AIAgent服务接口文档.md](./AIAgent服务接口文档.md) - 完整的API接口说明
- [API测试文档.md](./API测试文档.md) - API测试指南

---

**文档维护**: 如有接口变更，请及时更新本文档。

