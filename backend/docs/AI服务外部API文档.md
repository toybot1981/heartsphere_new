# AI服务外部API文档

**文档版本**: v1.0  
**创建日期**: 2025-12-29  
**适用对象**: 外部开发者

---

## 一、概述

本API提供统一的AI服务调用接口，支持文本生成、图片生成等功能。使用API Key进行认证，无需登录。

**基础URL**: `http://localhost:8081/api/ai`

---

## 二、认证方式

使用API Key进行认证，支持两种请求头格式：

**方式1**（推荐）:
```
Authorization: Bearer <your-api-key>
```

**方式2**:
```
X-API-Key: <your-api-key>
```

---

## 三、接口列表

### 3.1 文本生成（同步）

**接口**: `POST /api/ai/text/generate`

**请求示例**:
```bash
curl -X POST http://localhost:8081/api/ai/text/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hs_your_api_key_here" \
  -d '{
    "prompt": "你好，请介绍一下你自己",
    "temperature": 0.7,
    "maxTokens": 1000
  }'
```

**请求参数**:
- `prompt` (必填): 提示词
- `provider` (可选): 提供商（dashscope, gemini, openai, doubao, bigmodel）
- `model` (可选): 模型名称
- `systemInstruction` (可选): 系统指令
- `messages` (可选): 对话历史
- `temperature` (可选): 温度参数，0-1，默认0.7
- `maxTokens` (可选): 最大输出Token数

**响应示例**:
```json
{
  "code": 200,
  "message": "文本生成成功",
  "data": {
    "content": "你好！我是AI助手，很高兴为你服务。",
    "provider": "dashscope",
    "model": "qwen-max",
    "usage": {
      "inputTokens": 15,
      "outputTokens": 45,
      "totalTokens": 60
    },
    "finishReason": "stop"
  }
}
```

### 3.2 文本生成（流式）

**接口**: `POST /api/ai/text/generate/stream`

**请求示例**:
```bash
curl -X POST http://localhost:8081/api/ai/text/generate/stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hs_your_api_key_here" \
  -d '{
    "prompt": "写一篇关于人工智能的短文",
    "temperature": 0.7,
    "maxTokens": 2000,
    "stream": true
  }'
```

**响应格式**: Server-Sent Events (SSE)

### 3.3 OpenAPI兼容接口

**接口**: `POST /api/ai/v1/chat/completions`

**请求示例**:
```bash
curl -X POST http://localhost:8081/api/ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hs_your_api_key_here" \
  -d '{
    "model": "qwen-max",
    "messages": [
      {"role": "system", "content": "你是一个友好的助手"},
      {"role": "user", "content": "你好"}
    ],
    "temperature": 0.7,
    "max_tokens": 2048,
    "stream": false
  }'
```

**响应示例**:
```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "qwen-max",
  "choices": [{
    "index": 0,
    "message": {"role": "assistant", "content": "你好！有什么可以帮助你的吗？"},
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 200,
    "total_tokens": 300
  }
}
```

### 3.4 图片生成

**接口**: `POST /api/ai/image/generate`

**请求示例**:
```bash
curl -X POST http://localhost:8081/api/ai/image/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hs_your_api_key_here" \
  -d '{
    "prompt": "一只可爱的小猫",
    "width": 1024,
    "height": 1024
  }'
```

**请求参数**:
- `prompt` (必填): 图片描述
- `provider` (可选): 提供商
- `model` (可选): 模型名称
- `width` (可选): 图片宽度，默认1024
- `height` (可选): 图片高度，默认1024
- `numberOfImages` (可选): 生成数量，默认1

---

## 四、代码示例

### Python

```python
import requests

API_KEY = "hs_your_api_key_here"
BASE_URL = "http://localhost:8081"

# 文本生成
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

### Node.js

```javascript
const axios = require('axios');

const API_KEY = 'hs_your_api_key_here';
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

### JavaScript (Fetch)

```javascript
const API_KEY = 'hs_your_api_key_here';
const BASE_URL = 'http://localhost:8081';

fetch(`${BASE_URL}/api/ai/text/generate`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: '你好，请介绍一下你自己',
    temperature: 0.7,
    maxTokens: 1000
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

---

## 五、错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 认证失败（API Key无效、过期或已禁用） |
| 429 | 请求过于频繁（触发速率限制） |
| 500 | 服务器内部错误 |

**错误响应示例**:
```json
{
  "code": 401,
  "message": "API Key无效或已过期",
  "timestamp": "2025-12-29T08:00:00"
}
```

---

## 六、获取API Key

请联系管理员申请API Key，或访问管理后台创建。

API Key格式：`hs_` + 48位随机字符串

---

## 七、注意事项

1. **API Key安全**: 请妥善保管API Key，不要在公开场合泄露
2. **速率限制**: 如果API Key设置了速率限制，超过限制会返回429错误
3. **过期时间**: 如果API Key设置了过期时间，过期后无法使用
4. **配额管理**: API Key的使用会消耗对应的配额（如果关联了用户）
5. **HTTPS**: 生产环境建议使用HTTPS协议

---

**更多信息**: 如有疑问，请联系技术支持。



