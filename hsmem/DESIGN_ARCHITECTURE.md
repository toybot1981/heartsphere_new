# HSMem 记忆系统设计架构文档

## 📋 目录

1. [系统概述](#系统概述)
2. [架构设计](#架构设计)
3. [核心组件](#核心组件)
4. [数据流](#数据流)
5. [存储结构](#存储结构)
6. [API 接口](#api-接口)
7. [工作流程](#工作流程)
8. [功能验证](#功能验证)

---

## 系统概述

HSMem (HeartSphere Memory System) 是一个基于 memU 设计理念的轻量级记忆系统，为 HeartSphere 项目提供持久化记忆能力。

### 核心特性

- ✅ **三层架构**: Resource Layer → Memory Item Layer → Memory Category Layer
- ✅ **多模态支持**: 支持文本、对话、文档等多种数据形式
- ✅ **灵活检索**: 支持简单检索、RAG、LLM-based 检索（预留接口）
- ✅ **持久化存储**: 本地文件存储，易于扩展
- ✅ **可追溯性**: 从资源到记忆项的完整追溯链

---

## 架构设计

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    MemoryService                            │
│              (统一记忆管理接口)                               │
└──────────────┬──────────────────────────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                    │
┌───▼────────┐    ┌──────▼────────┐
│ Extractor  │    │   Retriever   │
│ (提取器)   │    │   (检索器)     │
└───┬────────┘    └──────┬─────────┘
    │                   │
    └──────────┬────────┘
               │
┌──────────────▼──────────────────────────────────────────────┐
│                    MemoryStore                              │
│              (三层存储架构)                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Layer 3: Memory Category Layer (记忆分类层)          │  │
│  │  - 聚合相关记忆项                                       │  │
│  │  - 生成 Markdown 文件                                   │  │
│  │  - 支持增量更新                                         │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │  Layer 2: Memory Item Layer (记忆项层)                │  │
│  │  - 离散的记忆单元                                       │  │
│  │  - 包含内容、摘要、类型、分类                           │  │
│  │  - 支持重要性评分                                       │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │  Layer 1: Resource Layer (资源层)                     │  │
│  │  - 原始多模态数据                                       │  │
│  │  - 保持数据完整性和可追溯性                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 三层架构详解

#### 1. Resource Layer (资源层)

**职责**:
- 存储原始多模态数据
- 保持数据的完整性和可追溯性
- 按模态类型组织存储

**存储位置**: `memory_data/resources/{modality}/{resource_id}.json`

**数据结构**:
```json
{
  "id": "uuid",
  "modality": "conversation|text|document",
  "data": {
    "messages": [...],  // 对话数据
    "text": "...",      // 文本数据
    "title": "...",     // 文档数据
    "content": "..."
  },
  "created_at": "2026-01-11T12:00:00",
  "metadata": {
    "size": 1024
  }
}
```

**实现类**: `ResourceLayer`

#### 2. Memory Item Layer (记忆项层)

**职责**:
- 从资源中提取离散记忆单元
- 包含内容、摘要、类型、分类
- 支持重要性评分
- 建立与资源的关联

**存储位置**: `memory_data/items/{item_id}.json`

**数据结构**:
```json
{
  "id": "uuid",
  "resource_id": "uuid",
  "content": "完整内容",
  "summary": "摘要",
  "memory_type": "preference|habit|personal_info|general",
  "importance": 0.7,
  "categories": ["preferences", "user_profile"],
  "user_id": "user_123",
  "agent_id": "agent_001",
  "metadata": {},
  "created_at": "2026-01-11T12:00:00",
  "updated_at": "2026-01-11T12:00:00"
}
```

**索引文件**: `memory_data/items/index.json`

**实现类**: `MemoryItemLayer`

#### 3. Memory Category Layer (记忆分类层)

**职责**:
- 聚合相关记忆项
- 生成 Markdown 文件便于 LLM 阅读
- 支持增量更新
- 自动版本管理

**存储位置**: 
- JSON: `memory_data/categories/{category_id}.json`
- Markdown: `memory_data/categories/{category_id}.md`

**数据结构 (JSON)**:
```json
{
  "id": "uuid",
  "name": "preferences",
  "summary": "关于偏好的记忆",
  "description": "包含 5 个记忆项",
  "item_ids": ["item_id_1", "item_id_2", ...],
  "metadata": {},
  "created_at": "2026-01-11T12:00:00",
  "updated_at": "2026-01-11T12:00:00",
  "version": 1
}
```

**数据结构 (Markdown)**:
```markdown
# preferences

## 概述
关于偏好的记忆

## 描述
包含 5 个记忆项

## 创建时间
2026-01-11T12:00:00

## 更新时间
2026-01-11T12:00:00

## 版本
1
```

**索引文件**: `memory_data/categories/categories_index.json`

**实现类**: `MemoryCategoryLayer`

---

## 核心组件

### 1. MemoryService (记忆服务)

**位置**: `hscore/memory/memory_service.py`

**职责**: 统一的记忆管理接口，整合记忆提取和检索

**主要方法**:

```python
class MemoryService:
    def __init__(self, base_path, llm_client=None, retrieve_config=None)
    
    async def memorize(resource_data, modality, user_id=None, agent_id=None)
    # 记忆化 - 从资源中提取并存储记忆
    
    async def retrieve(queries, where=None, limit=10)
    # 检索记忆
    
    async def get_statistics()
    # 获取记忆系统统计信息
    
    async def get_all_categories()
    # 获取所有分类
    
    async def search_by_category(category_name)
    # 按分类搜索
```

**工作流程**:
1. 接收资源数据
2. 存储到 Resource Layer
3. 使用 Extractor 提取记忆项
4. 存储记忆项到 Memory Item Layer
5. 按分类组织记忆项
6. 创建/更新 Memory Category Layer

### 2. MemoryExtractor (记忆提取器)

**位置**: `hscore/memory/memory_extractor.py`

**职责**: 从原始资源中提取记忆项

**支持模态**:
- `conversation`: 对话记忆
- `text`: 文本记忆
- `document`: 文档记忆

**提取策略**:
- **规则提取** (当前实现): 基于关键词匹配
  - 偏好提取: "喜欢", "爱", "偏好", "prefer", "like", "love"
  - 习惯提取: "每天", "经常", "总是", "习惯", "usually", "always"
  - 个人信息提取: "我叫", "我是"
- **LLM 提取** (预留接口): 使用 LLM 进行智能提取

**提取结果**:
```python
{
    "content": "完整内容",
    "summary": "摘要",
    "memory_type": "preference|habit|personal_info|text_memory|document",
    "categories": ["preferences", "user_profile"],
    "importance": 0.5-0.8
}
```

### 3. MemoryRetriever (记忆检索器)

**位置**: `hscore/memory/memory_retriever.py`

**职责**: 多策略记忆检索

**检索方法**:
- **simple** (当前实现): 基于关键词匹配
  - 检查分类名称、描述、摘要中的关键词
  - 计算匹配分数
  - 按分数排序返回
- **rag** (预留接口): 基于向量相似度
  - 使用向量数据库和嵌入模型
- **llm** (预留接口): 基于 LLM 深度理解
  - 让 LLM 阅读记忆文件并理解语义

### 4. MemoryStore (记忆存储)

**位置**: `hscore/storage/memory_store.py`

**职责**: 三层存储架构的统一接口

**组件**:
- `ResourceLayer`: 资源层存储
- `MemoryItemLayer`: 记忆项层存储
- `MemoryCategoryLayer`: 记忆分类层存储

---

## 数据流

### 记忆化流程 (Memorize)

```
用户输入 (对话/文本/文档)
    │
    ▼
MemoryService.memorize()
    │
    ├─→ ResourceLayer.store() ──→ 存储原始资源 ──→ resource_id
    │
    ├─→ MemoryExtractor.extract_from_*() ──→ 提取记忆项 ──→ [memory_items]
    │
    ├─→ MemoryItemLayer.store() ──→ 存储记忆项 ──→ [item_ids]
    │
    └─→ MemoryCategoryLayer.store() ──→ 组织分类 ──→ [category_ids]
    
返回结果:
{
    "resource_id": "...",
    "items_count": 3,
    "categories": [...],
    "modality": "conversation"
}
```

### 检索流程 (Retrieve)

```
查询请求 (queries)
    │
    ▼
MemoryService.retrieve()
    │
    ├─→ 合并查询文本
    │
    ├─→ MemoryRetriever.retrieve()
    │   │
    │   ├─→ simple: 关键词匹配
    │   ├─→ rag: 向量相似度 (预留)
    │   └─→ llm: LLM 理解 (预留)
    │
    └─→ 返回匹配的记忆分类
    
返回结果:
{
    "method": "simple",
    "query": "...",
    "items": [...],
    "total": 5
}
```

---

## 存储结构

### 目录结构

```
memory_data/
├── resources/                    # 资源层
│   ├── conversation/            # 对话资源
│   │   └── {resource_id}.json
│   ├── text/                    # 文本资源
│   │   └── {resource_id}.json
│   └── document/                # 文档资源
│       └── {resource_id}.json
│
├── items/                        # 记忆项层
│   ├── {item_id}.json           # 各个记忆项
│   └── index.json               # 全局索引
│
└── categories/                   # 记忆分类层
    ├── {category_id}.json       # 分类数据 (JSON)
    ├── {category_id}.md         # 分类数据 (Markdown)
    └── categories_index.json    # 分类索引
```

### 索引结构

**items/index.json**:
```json
{
  "item_id_1": {
    "resource_id": "resource_id_1",
    "memory_type": "preference",
    "categories": ["preferences", "user_profile"],
    "created_at": "2026-01-11T12:00:00"
  },
  ...
}
```

**categories/categories_index.json**:
```json
{
  "category_id_1": {
    "name": "preferences",
    "item_count": 5,
    "created_at": "2026-01-11T12:00:00",
    "updated_at": "2026-01-11T12:00:00"
  },
  ...
}
```

---

## API 接口

### REST API (rest_api_server.py)

**基础地址**: `http://localhost:8000`

#### 健康检查
```
GET /health
返回: {"status": "healthy", "statistics": {...}}
```

#### 记忆化接口

**对话记忆**:
```
POST /api/v1/memory/memorize/conversation
Body: {
    "messages": [...],
    "user_id": "user_123",
    "agent_id": "agent_001"
}
```

**文本记忆**:
```
POST /api/v1/memory/memorize/text
Body: {
    "text": "...",
    "context": {...},
    "user_id": "user_123"
}
```

**文档记忆**:
```
POST /api/v1/memory/memorize/document
Body: {
    "title": "...",
    "content": "...",
    "author": "...",
    "user_id": "user_123"
}
```

#### 检索接口

```
POST /api/v1/memory/retrieve
Body: {
    "queries": [
        {"role": "user", "content": {"text": "..."}}
    ],
    "where": {"user_id": "user_123"},
    "limit": 10
}
```

#### 统计接口

```
GET /api/v1/stats
返回: {
    "statistics": {
        "resources_count": 10,
        "items_count": 30,
        "categories_count": 6
    }
}
```

#### 分类接口

```
GET /api/v1/categories
返回: [{"id": "...", "name": "...", ...}, ...]

GET /api/v1/categories/{category_name}/items
返回: [记忆项列表]
```

---

## 工作流程

### 完整记忆化示例

```python
import asyncio
from hscore import MemoryService

async def main():
    # 1. 初始化服务
    service = MemoryService(
        base_path="./memory_data",
        retrieve_config={"method": "simple"}
    )
    
    # 2. 准备对话数据
    conversation = {
        "messages": [
            {"role": "user", "content": "我叫张三，喜欢编程和阅读"},
            {"role": "assistant", "content": "你好张三！"},
            {"role": "user", "content": "我每天都会学习新技术"}
        ]
    }
    
    # 3. 记忆化
    result = await service.memorize(
        resource_data=conversation,
        modality="conversation",
        user_id="user_001"
    )
    
    # 结果:
    # {
    #     "resource_id": "uuid",
    #     "items_count": 3,
    #     "categories": [
    #         {"id": "...", "name": "preferences", "item_count": 1},
    #         {"id": "...", "name": "habits", "item_count": 1},
    #         {"id": "...", "name": "personal_info", "item_count": 1}
    #     ],
    #     "modality": "conversation"
    # }
    
    # 4. 检索记忆
    queries = [{"role": "user", "content": {"text": "张三喜欢什么？"}}]
    retrieve_result = await service.retrieve(queries=queries)
    
    # 5. 获取统计
    stats = await service.get_statistics()

asyncio.run(main())
```

### 数据流转示例

**输入**: 对话数据
```json
{
  "messages": [
    {"role": "user", "content": "我叫张三，喜欢编程"},
    {"role": "assistant", "content": "你好张三！"}
  ]
}
```

**步骤 1**: 存储到 Resource Layer
```json
// resources/conversation/{resource_id}.json
{
  "id": "resource_id_1",
  "modality": "conversation",
  "data": {原始对话数据},
  "created_at": "2026-01-11T12:00:00"
}
```

**步骤 2**: 提取记忆项
```python
[
  {
    "content": "我叫张三",
    "summary": "个人信息: 我叫张三",
    "memory_type": "personal_info",
    "categories": ["personal_info", "basic_info"],
    "importance": 0.8
  },
  {
    "content": "喜欢编程",
    "summary": "用户有 1 个偏好",
    "memory_type": "preference",
    "categories": ["preferences", "user_profile"],
    "importance": 0.7
  }
]
```

**步骤 3**: 存储到 Memory Item Layer
```json
// items/{item_id}.json
{
  "id": "item_id_1",
  "resource_id": "resource_id_1",
  "content": "我叫张三",
  "memory_type": "personal_info",
  "categories": ["personal_info", "basic_info"],
  ...
}
```

**步骤 4**: 组织到 Memory Category Layer
```json
// categories/{category_id}.json
{
  "id": "category_id_1",
  "name": "personal_info",
  "item_ids": ["item_id_1"],
  ...
}
```

```markdown
// categories/{category_id}.md
# personal_info

## 概述
关于 personal_info 的记忆

## 描述
包含 1 个记忆项
```

---

## 功能验证

### 测试结果

✅ **记忆化功能**: 成功
- 资源存储: ✅
- 记忆项提取: ✅
- 分类组织: ✅

✅ **检索功能**: 成功
- 关键词匹配: ✅
- 分类搜索: ✅

✅ **统计功能**: 成功
- 资源统计: ✅
- 记忆项统计: ✅
- 分类统计: ✅

### 测试用例

**测试 1: 对话记忆化**
```python
输入: {"messages": [{"role": "user", "content": "我叫张三，喜欢编程"}]}
输出: 
- resource_id: ✅
- items_count: 3 ✅
- categories: 6 ✅
```

**测试 2: 记忆检索**
```python
输入: queries = [{"role": "user", "content": {"text": "张三喜欢什么？"}}]
输出: 检索结果 ✅
```

**测试 3: 统计信息**
```python
输出: {
    "resources_count": 1,
    "items_count": 3,
    "categories_count": 6
} ✅
```

---

## 设计特点

### 1. 可追溯性

每个记忆项都关联到原始资源:
```
Resource (resource_id) 
    └─→ Memory Items (item_ids)
            └─→ Memory Categories (category_ids)
```

### 2. 增量更新

- 新记忆项可以添加到现有分类
- 分类支持版本管理
- Markdown 文件自动更新

### 3. 可扩展性

- 预留 LLM 提取接口
- 预留 RAG 检索接口
- 预留多模态支持接口

### 4. LLM 友好

- 分类层生成 Markdown 文件
- 结构化的记忆组织
- 易于 LLM 阅读和理解

---

## 总结

HSMem 记忆系统实现了完整的三层架构设计，具备以下特点:

✅ **完整性**: 从资源存储到记忆检索的完整流程
✅ **可追溯性**: 完整的追溯链
✅ **可扩展性**: 预留多种扩展接口
✅ **LLM 友好**: Markdown 格式便于 LLM 阅读
✅ **持久化**: 文件系统存储，数据安全可靠

系统已准备好与 HeartSphere 项目集成，为 AI 伴侣提供持久化记忆能力。
