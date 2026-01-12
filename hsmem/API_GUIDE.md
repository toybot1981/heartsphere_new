# HSMem REST API 使用指南

## 🚀 快速启动

### 1. 安装依赖

```bash
pip install fastapi uvicorn
```

### 2. 启动 API 服务器

```bash
python3 rest_api_server.py
```

服务器将在 `http://localhost:8000` 启动

### 3. 访问 API 文档

打开浏览器访问:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 📡 API 接口

### 基础接口

#### 健康检查
```
GET /health
```

**响应示例:**
```json
{
  "status": "healthy",
  "statistics": {
    "resources_count": 10,
    "items_count": 30,
    "categories_count": 5
  }
}
```

### 记忆化接口

#### 1. 记忆化对话
```
POST /api/v1/memory/memorize/conversation
```

**请求体:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": {"text": "你好，我是李明"}
    },
    {
      "role": "assistant",
      "content": {"text": "你好李明！"}
    }
  ],
  "user_id": "user_123",
  "agent_id": "agent_1"
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "resource_id": "uuid",
    "items_count": 2,
    "categories": [
      {"name": "personal_info", "item_count": 1},
      {"name": "preferences", "item_count": 1}
    ]
  }
}
```

#### 2. 记忆化文本
```
POST /api/v1/memory/memorize/text
```

**请求体:**
```json
{
  "text": "这是一段重要的文本",
  "context": {"topic": "general"},
  "user_id": "user_123"
}
```

#### 3. 记忆化文档
```
POST /api/v1/memory/memorize/document
```

**请求体:**
```json
{
  "title": "文档标题",
  "content": "文档内容",
  "author": "作者名",
  "user_id": "user_123"
}
```

### 检索接口

#### 检索记忆
```
POST /api/v1/memory/retrieve
```

**请求体:**
```json
{
  "queries": [
    {
      "role": "user",
      "content": {"text": "李明喜欢什么？"}
    }
  ],
  "where": {"user_id": "user_123"},
  "limit": 10
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "method": "simple",
    "items": [
      {
        "id": "uuid",
        "summary": "用户喜欢编程",
        "memory_type": "preference"
      }
    ]
  }
}
```

### 统计接口

#### 获取统计信息
```
GET /api/v1/memory/statistics
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "resources_count": 10,
      "items_count": 30,
      "categories_count": 5
    },
    "status": "healthy"
  }
}
```

### 分类接口

#### 获取所有分类
```
GET /api/v1/memory/categories
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "preferences",
        "item_count": 5
      }
    ],
    "total": 5
  }
}
```

#### 获取分类下的记忆项
```
GET /api/v1/memory/categories/{category_name}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "category": "preferences",
    "items": [...],
    "total": 5
  }
}
```

## 💡 使用示例

### Python 客户端

```python
import requests

# 配置
BASE_URL = "http://localhost:8000"

# 1. 记忆化对话
response = requests.post(f"{BASE_URL}/api/v1/memory/memorize/conversation", json={
    "messages": [
        {"role": "user", "content": {"text": "我叫张三"}},
        {"role": "assistant", "content": {"text": "你好张三！"}}
    ],
    "user_id": "user_001"
})
print(response.json())

# 2. 检索记忆
response = requests.post(f"{BASE_URL}/api/v1/memory/retrieve", json={
    "queries": [
        {"role": "user", "content": {"text": "张三是谁？"}}
    ]
})
print(response.json())

# 3. 获取统计
response = requests.get(f"{BASE_URL}/api/v1/memory/statistics")
print(response.json())
```

### cURL 示例

```bash
# 健康检查
curl http://localhost:8000/health

# 记忆化对话
curl -X POST http://localhost:8000/api/v1/memory/memorize/conversation \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": {"text": "我叫李明"}},
      {"role": "assistant", "content": {"text": "你好李明！"}}
    ],
    "user_id": "user_001"
  }'

# 检索记忆
curl -X POST http://localhost:8000/api/v1/memory/retrieve \
  -H "Content-Type: application/json" \
  -d '{
    "queries": [
      {"role": "user", "content": {"text": "李明"}}
    ]
  }'

# 获取统计
curl http://localhost:8000/api/v1/memory/statistics
```

### JavaScript/TypeScript 示例

```javascript
const BASE_URL = 'http://localhost:8000';

// 记忆化对话
async function memorizeConversation() {
  const response = await fetch(`${BASE_URL}/api/v1/memory/memorize/conversation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: { text: '我叫李明' } },
        { role: 'assistant', content: { text: '你好李明！' } }
      ],
      user_id: 'user_001'
    })
  });
  const data = await response.json();
  console.log(data);
}

// 检索记忆
async function retrieveMemory() {
  const response = await fetch(`${BASE_URL}/api/v1/memory/retrieve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      queries: [
        { role: 'user', content: { text: '李明是谁？' } }
      ]
    })
  });
  const data = await response.json();
  console.log(data);
}
```

## 🧪 测试 API

### 自动测试

运行自动化测试脚本:

```bash
# 终端 1: 启动服务器
python3 rest_api_server.py

# 终端 2: 运行测试
python3 test_rest_api.py
```

### 手动测试

1. 启动服务器
2. 访问 http://localhost:8000/docs
3. 使用 Swagger UI 界面测试各个接口

## 🔧 配置选项

### 服务器配置

```python
# 在 rest_api_server.py 中修改
uvicorn.run(
    app,
    host="0.0.0.0",      # 监听地址
    port=8000,            # 端口
    log_level="info"      # 日志级别
)
```

### 数据存储配置

```python
# 修改记忆数据存储路径
memory_service = MemoryService(base_path="./your_custom_path")
```

## 📊 API 响应格式

所有 API 响应遵循统一格式:

```json
{
  "success": true/false,
  "data": {...},
  "error": "错误信息（如果失败）"
}
```

## ⚠️ 错误处理

### 错误响应示例

```json
{
  "success": false,
  "error": "Invalid request format"
}
```

### HTTP 状态码

- `200` - 成功
- `400` - 请求格式错误
- `500` - 服务器内部错误

## 🔐 安全建议

1. **生产环境**: 添加身份验证
2. **CORS**: 限制允许的源
3. **速率限制**: 添加请求限流
4. **HTTPS**: 使用 SSL/TLS

## 🚀 性能优化

1. 使用连接池
2. 启用缓存
3. 批量操作
4. 异步处理

## 📚 更多资源

- FastAPI 文档: https://fastapi.tiangolo.com/
- Uvicorn 文档: https://www.uvicorn.org/
- HSMem 使用指南: [USAGE.md](USAGE.md)

---

**HSMem API** - 为 AI 提供持久化记忆能力 ❤️
