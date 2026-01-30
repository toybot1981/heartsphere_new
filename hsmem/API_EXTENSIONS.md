# HSMem API 扩展文档

## 📅 扩展日期
2026-01-11

## 🎯 扩展目标
为了支持管理端的记忆提取追溯功能，扩展了 hsmem REST API，添加了资源查询、记忆项查询等接口。

## ✨ 新增接口

### 1. 记忆项查询接口

#### 获取所有记忆项
```
GET /api/v1/memory/items?user_id={user_id}
```

**查询参数**:
- `user_id` (可选): 按用户ID过滤记忆项

**响应示例**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "item_id_1",
        "resource_id": "resource_id_1",
        "user_id": "user_123",
        "content": "完整内容",
        "summary": "摘要",
        "memory_type": "preference",
        "categories": ["preferences", "user_profile"],
        "importance": 0.7,
        "created_at": "2026-01-11T12:00:00",
        "updated_at": "2026-01-11T12:00:00"
      }
    ],
    "total": 1
  }
}
```

#### 获取记忆项详情
```
GET /api/v1/memory/items/{item_id}
```

**路径参数**:
- `item_id`: 记忆项ID

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "item_id_1",
    "resource_id": "resource_id_1",
    "user_id": "user_123",
    "content": "完整内容",
    "summary": "摘要",
    "memory_type": "preference",
    "categories": ["preferences", "user_profile"],
    "importance": 0.7,
    "created_at": "2026-01-11T12:00:00",
    "updated_at": "2026-01-11T12:00:00"
  }
}
```

**错误响应** (404):
```json
{
  "detail": "记忆项 item_id_1 不存在"
}
```

### 2. 资源查询接口

#### 获取所有资源
```
GET /api/v1/memory/resources
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "resources": [
      {
        "id": "resource_id_1",
        "modality": "conversation",
        "data": {
          "messages": [...]
        },
        "created_at": "2026-01-11T12:00:00",
        "metadata": {
          "size": 1024
        }
      }
    ],
    "total": 1
  }
}
```

#### 获取资源详情
```
GET /api/v1/memory/resources/{resource_id}
```

**路径参数**:
- `resource_id`: 资源ID

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "resource_id_1",
    "modality": "conversation",
    "data": {
      "messages": [
        {
          "role": "user",
          "content": "我叫张三"
        },
        {
          "role": "assistant",
          "content": "你好张三！"
        }
      ]
    },
    "created_at": "2026-01-11T12:00:00",
    "metadata": {
      "size": 1024
    }
  }
}
```

**错误响应** (404):
```json
{
  "detail": "资源 resource_id_1 不存在"
}
```

## 🔧 功能增强

### 1. 检索接口的 where 过滤功能

修复了 `POST /api/v1/memory/retrieve` 接口的 `where` 参数过滤逻辑，现在可以正确按 `user_id` 过滤结果。

**请求示例**:
```json
{
  "queries": [
    {
      "role": "user",
      "content": {"text": "用户喜欢什么？"}
    }
  ],
  "where": {
    "user_id": "user_123"
  },
  "limit": 10
}
```

现在，检索结果只会返回包含该用户记忆项的分类。

## 📊 底层方法扩展

### MemoryItemLayer 新增方法

1. `get_all()` - 获取所有记忆项
2. `search_by_user_id(user_id)` - 按用户ID搜索记忆项

### ResourceLayer 新增方法

1. `get_all()` - 获取所有资源

### MemoryStore 新增方法

1. `get_all_items(user_id=None)` - 获取所有记忆项（支持按用户ID过滤）
2. `get_all_resources()` - 获取所有资源

### MemoryService 新增方法

1. `get_all_items(user_id=None)` - 获取所有记忆项（支持按用户ID过滤）
2. `get_all_resources()` - 获取所有资源

### MemoryRetriever 增强

- `_simple_retrieve()` 方法现在支持 `where` 参数的 `user_id` 过滤

## 🧪 使用示例

### 1. 按用户ID获取所有记忆项

```python
import requests

response = requests.get(
    "http://localhost:8000/api/v1/memory/items",
    params={"user_id": "user_123"}
)
data = response.json()
print(f"找到 {data['data']['total']} 个记忆项")
```

### 2. 获取记忆项详情

```python
import requests

response = requests.get(
    "http://localhost:8000/api/v1/memory/items/item_id_1"
)
item = response.json()['data']
print(f"记忆项: {item['summary']}")
print(f"关联资源: {item['resource_id']}")
```

### 3. 获取资源详情

```python
import requests

response = requests.get(
    "http://localhost:8000/api/v1/memory/resources/resource_id_1"
)
resource = response.json()['data']
print(f"资源类型: {resource['modality']}")
print(f"原始数据: {resource['data']}")
```

### 4. 获取所有资源

```python
import requests

response = requests.get("http://localhost:8000/api/v1/memory/resources")
resources = response.json()['data']['resources']
print(f"总共有 {len(resources)} 个资源")
```

## 📝 注意事项

1. **性能考虑**: 
   - 获取所有资源或记忆项时，如果数据量很大，建议在前端或客户端进行分页处理
   - 考虑添加分页参数（limit, offset）以优化性能

2. **数据过滤**:
   - 资源数据本身不包含 `user_id` 字段，需要通过关联的记忆项来追溯
   - 记忆项包含 `user_id` 和 `resource_id` 字段，可以建立完整的追溯链

3. **错误处理**:
   - 所有接口都返回统一的响应格式：`{"success": true, "data": {...}}`
   - 错误时返回适当的 HTTP 状态码和错误信息

## 🔄 向后兼容性

- ✅ 所有现有接口保持不变
- ✅ 新增接口不影响现有功能
- ✅ 检索接口的 `where` 参数增强不影响现有调用方式

## 📚 相关文档

- API 完整文档: http://localhost:8000/docs
- API 使用指南: `API_GUIDE.md`
- 设计架构文档: `DESIGN_ARCHITECTURE.md`
