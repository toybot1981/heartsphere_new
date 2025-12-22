# 大模型统一接入层 API 测试文档

**文档版本**: V1.0  
**编写日期**: 2025-12-21  
**测试环境**: http://localhost:8081

---

## 一、前置准备

### 1.1 环境变量配置

确保设置了DashScope API Key：

```bash
export DASHSCOPE_API_KEY=your-api-key-here
```

或在 `application.yml` 中配置：

```yaml
spring:
  ai:
    dashscope:
      api-key: your-api-key-here
```

### 1.2 获取认证Token

所有API都需要用户认证，先登录获取Token：

```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "password123"
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

---

## 二、文本生成API

### 2.1 同步文本生成

**接口**: `POST /api/ai/text/generate`

**请求示例**:
```bash
curl -X POST http://localhost:8081/api/ai/text/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "prompt": "你好，请介绍一下你自己",
    "provider": "dashscope",
    "model": "qwen-max",
    "temperature": 0.7,
    "maxTokens": 1000
  }'
```

**请求参数**:
- `prompt` (必填): 提示词
- `provider` (可选): 提供商，如 dashscope
- `model` (可选): 模型名称，如 qwen-max
- `systemInstruction` (可选): 系统指令
- `messages` (可选): 对话历史
- `temperature` (可选): 温度参数，0-1，默认0.7
- `maxTokens` (可选): 最大输出Token数
- `stream` (可选): 是否流式返回，默认false

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "content": "你好！我是通义千问，一个由阿里云开发的大语言模型...",
    "provider": "dashscope",
    "model": "qwen-max",
    "usage": {
      "inputTokens": 15,
      "outputTokens": 45,
      "totalTokens": 60
    },
    "finishReason": "stop"
  },
  "timestamp": "2025-12-21T10:30:00"
}
```

### 2.2 流式文本生成

**接口**: `POST /api/ai/text/generate/stream`

**请求示例**:
```bash
curl -X POST http://localhost:8081/api/ai/text/generate/stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "prompt": "请写一首关于春天的诗",
    "provider": "dashscope",
    "model": "qwen-max",
    "stream": true
  }'
```

**响应格式** (Server-Sent Events):
```
data: {"content": "春风", "done": false}
data: {"content": "拂面", "done": false}
data: {"content": "绿意", "done": false}
data: {"content": "盎然", "done": true, "usage": {...}}
```

**测试脚本** (使用EventSource):
```javascript
const eventSource = new EventSource('/api/ai/text/generate/stream', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: '请写一首关于春天的诗',
    stream: true
  })
});

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.content);
  if (data.done) {
    eventSource.close();
  }
};
```

---

## 三、图片生成API

### 3.1 生成图片

**接口**: `POST /api/ai/image/generate`

**请求示例**:
```bash
curl -X POST http://localhost:8081/api/ai/image/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "prompt": "一只可爱的小猫坐在窗台上，阳光洒在它身上",
    "provider": "dashscope",
    "model": "wanx-v1",
    "width": 1024,
    "height": 1024,
    "numberOfImages": 1
  }'
```

**请求参数**:
- `prompt` (必填): 图片生成提示词
- `provider` (可选): 提供商
- `model` (可选): 模型名称
- `width` (可选): 图片宽度，默认1024
- `height` (可选): 图片高度，默认1024
- `aspectRatio` (可选): 宽高比，如 "1:1", "16:9"
- `numberOfImages` (可选): 生成图片数量，默认1
- `style` (可选): 图片风格

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "images": [
      {
        "url": "https://dashscope.aliyuncs.com/...",
        "base64": null
      }
    ],
    "provider": "dashscope",
    "model": "wanx-v1",
    "usage": {
      "imagesGenerated": 1
    }
  }
}
```

---

## 四、音频处理API

### 4.1 文本转语音 (TTS)

**接口**: `POST /api/ai/audio/tts`

**请求示例**:
```bash
curl -X POST http://localhost:8081/api/ai/audio/tts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "text": "你好，这是一段测试文本",
    "provider": "dashscope",
    "model": "sambert-zhichu-v1",
    "voice": "zhitian_emo",
    "speed": 1.0,
    "pitch": 1.0
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "content": "https://...",
    "audioBase64": "...",
    "duration": 3.5,
    "provider": "dashscope",
    "model": "sambert-zhichu-v1"
  }
}
```

### 4.2 语音转文本 (STT)

**接口**: `POST /api/ai/audio/stt`

**请求示例** (multipart/form-data):
```bash
curl -X POST http://localhost:8081/api/ai/audio/stt \
  -H "Authorization: Bearer <token>" \
  -F "audioFile=@audio.wav" \
  -F "provider=dashscope" \
  -F "model=paraformer-v2" \
  -F "language=zh-CN"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "content": "你好，这是一段识别出的文本",
    "provider": "dashscope",
    "model": "paraformer-v2",
    "confidence": 0.95,
    "duration": 3.5
  }
}
```

---

## 五、视频生成API

### 5.1 生成视频

**接口**: `POST /api/ai/video/generate`

**请求示例**:
```bash
curl -X POST http://localhost:8081/api/ai/video/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "prompt": "一只小猫在花园里玩耍",
    "provider": "dashscope",
    "model": "wanx-video",
    "duration": 5,
    "resolution": "1080p"
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "videoUrl": "https://...",
    "videoId": "video_123",
    "status": "completed",
    "provider": "dashscope",
    "model": "wanx-video",
    "duration": 5
  }
}
```

---

## 六、配置管理API

### 6.1 获取用户配置

**接口**: `GET /api/ai/config`

**请求示例**:
```bash
curl -X GET http://localhost:8081/api/ai/config \
  -H "Authorization: Bearer <token>"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "textProvider": "dashscope",
    "textModel": "qwen-max",
    "imageProvider": "dashscope",
    "imageModel": "wanx-v1",
    "enableFallback": true
  }
}
```

### 6.2 更新用户配置

**接口**: `PUT /api/ai/config`

**请求示例**:
```bash
curl -X PUT http://localhost:8081/api/ai/config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "textProvider": "dashscope",
    "textModel": "qwen-plus",
    "imageProvider": "dashscope",
    "imageModel": "wanx-v1",
    "enableFallback": true
  }'
```

---

## 七、错误处理

### 7.1 错误响应格式

```json
{
  "code": 500,
  "message": "AI服务调用失败: 模型不可用",
  "data": null,
  "timestamp": "2025-12-21T10:30:00"
}
```

### 7.2 常见错误码

- `400`: 请求参数错误
- `401`: 未授权
- `404`: 资源不存在
- `500`: 服务器内部错误
- `503`: 服务不可用

---

## 八、测试用例

### 8.1 Postman测试集合

可以导入以下Postman集合进行测试：

```json
{
  "info": {
    "name": "AI Service API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "文本生成",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"prompt\": \"你好\",\n  \"provider\": \"dashscope\"\n}"
        },
        "url": {
          "raw": "http://localhost:8081/api/ai/text/generate",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8081",
          "path": ["api", "ai", "text", "generate"]
        }
      }
    }
  ]
}
```

### 8.2 自动化测试脚本

```bash
#!/bin/bash

# 设置变量
BASE_URL="http://localhost:8081"
TOKEN="your-token-here"

# 测试文本生成
echo "测试文本生成..."
curl -X POST "$BASE_URL/api/ai/text/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "你好",
    "provider": "dashscope"
  }' | jq .

# 测试图片生成
echo "测试图片生成..."
curl -X POST "$BASE_URL/api/ai/image/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "一只可爱的小猫",
    "provider": "dashscope"
  }' | jq .
```

---

## 九、性能测试

### 9.1 响应时间测试

使用Apache Bench进行压力测试：

```bash
# 文本生成压力测试
ab -n 100 -c 10 -H "Authorization: Bearer <token>" \
   -p request.json -T application/json \
   http://localhost:8081/api/ai/text/generate
```

### 9.2 并发测试

使用JMeter或Gatling进行并发测试。

---

## 十、注意事项

1. **API Key安全**: 确保API Key不暴露在前端代码中
2. **限流**: 注意API调用频率限制
3. **Token使用**: 监控Token使用量，避免超限
4. **错误处理**: 所有API调用都要有错误处理机制
5. **日志记录**: 记录所有API调用，便于调试和监控

---

**文档维护**: 本文档应随API更新持续维护。


