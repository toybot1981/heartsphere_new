# HSMem 记忆系统设计梳理

## 📌 执行摘要

本文档完整梳理了 HSMem 记忆系统的设计架构、实现细节和功能验证结果。

**系统状态**: ✅ 功能完整，运行正常

**核心特点**:
- 三层架构设计 (Resource → Item → Category)
- 多模态支持 (对话/文本/文档)
- 完整的记忆化流程
- 灵活的检索机制
- 持久化文件存储

---

## 🏗️ 系统架构

### 架构层次

```
┌─────────────────────────────────────────┐
│      MemoryService (统一接口)            │
│  - memorize() 记忆化                      │
│  - retrieve() 检索                        │
│  - get_statistics() 统计                  │
└──────────────┬──────────────────────────┘
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
┌──────────────▼──────────────────────────┐
│         MemoryStore (存储层)              │
├──────────────────────────────────────────┤
│  Layer 3: Memory Category Layer          │
│  - 聚合记忆项                              │
│  - Markdown 格式                           │
│  - 版本管理                                │
├──────────────────────────────────────────┤
│  Layer 2: Memory Item Layer              │
│  - 离散记忆单元                            │
│  - 内容/摘要/类型/分类                     │
│  - 重要性评分                              │
├──────────────────────────────────────────┤
│  Layer 1: Resource Layer                 │
│  - 原始多模态数据                          │
│  - 完整性和可追溯性                        │
└──────────────────────────────────────────┘
```

---

## 🔄 记忆化流程详解

### 完整流程

```
1. 输入数据 (对话/文本/文档)
   │
   ▼
2. MemoryService.memorize()
   │
   ├─→ 3. ResourceLayer.store()
   │      └─→ 存储原始资源 → resource_id
   │
   ├─→ 4. MemoryExtractor.extract_from_*()
   │      ├─→ 规则提取 (关键词匹配)
   │      └─→ 生成记忆项列表
   │
   ├─→ 5. MemoryItemLayer.store()
   │      └─→ 存储每个记忆项 → item_ids
   │
   └─→ 6. MemoryCategoryLayer.store()
          ├─→ 按分类组织记忆项
          ├─→ 创建/更新分类
          └─→ 生成 Markdown 文件
```

### 数据转换示例

**输入**: 对话
```json
{
  "messages": [
    {"role": "user", "content": "我叫张三，喜欢编程"},
    {"role": "assistant", "content": "你好张三！"}
  ]
}
```

**输出**: 三层数据

**Layer 1 - Resource**:
```json
{
  "id": "resource_id_1",
  "modality": "conversation",
  "data": {原始对话},
  "created_at": "2026-01-11T12:00:00"
}
```

**Layer 2 - Memory Items**:
```json
[
  {
    "id": "item_id_1",
    "resource_id": "resource_id_1",
    "content": "我叫张三",
    "memory_type": "personal_info",
    "categories": ["personal_info", "basic_info"],
    "importance": 0.8
  },
  {
    "id": "item_id_2",
    "resource_id": "resource_id_1",
    "content": "喜欢编程",
    "memory_type": "preference",
    "categories": ["preferences", "user_profile"],
    "importance": 0.7
  }
]
```

**Layer 3 - Memory Categories**:
```json
{
  "id": "category_id_1",
  "name": "personal_info",
  "item_ids": ["item_id_1"],
  "summary": "关于 personal_info 的记忆"
}
```

```markdown
# personal_info

## 概述
关于 personal_info 的记忆

## 描述
包含 1 个记忆项
```

---

## 🧩 核心组件

### 1. MemoryService

**文件**: `hscore/memory/memory_service.py`

**职责**: 统一记忆管理接口

**关键方法**:
- `memorize()`: 记忆化资源
- `retrieve()`: 检索记忆
- `get_statistics()`: 获取统计
- `get_all_categories()`: 获取所有分类
- `search_by_category()`: 按分类搜索

### 2. MemoryExtractor

**文件**: `hscore/memory/memory_extractor.py`

**职责**: 从资源中提取记忆项

**提取策略**:
- **对话提取**: 
  - 偏好: "喜欢", "爱", "偏好"
  - 习惯: "每天", "经常", "总是"
  - 个人信息: "我叫", "我是"
- **文本提取**: 直接作为记忆项
- **文档提取**: 标题+内容组合

**输出格式**:
```python
{
    "content": "完整内容",
    "summary": "摘要",
    "memory_type": "preference|habit|personal_info|...",
    "categories": ["preferences", "user_profile"],
    "importance": 0.5-0.8
}
```

### 3. MemoryRetriever

**文件**: `hscore/memory/memory_retriever.py`

**职责**: 多策略记忆检索

**检索方法**:
- **simple**: 关键词匹配 (已实现)
- **rag**: 向量相似度 (预留)
- **llm**: LLM 理解 (预留)

### 4. MemoryStore

**文件**: `hscore/storage/memory_store.py`

**职责**: 三层存储统一接口

**组件**:
- `ResourceLayer`: 资源存储
- `MemoryItemLayer`: 记忆项存储
- `MemoryCategoryLayer`: 分类存储

---

## 💾 存储结构

### 目录组织

```
memory_data/
├── resources/              # 资源层
│   ├── conversation/     # 对话资源
│   ├── text/             # 文本资源
│   └── document/         # 文档资源
│
├── items/                 # 记忆项层
│   ├── {item_id}.json    # 记忆项文件
│   └── index.json        # 全局索引
│
└── categories/            # 分类层
    ├── {category_id}.json    # JSON 格式
    ├── {category_id}.md      # Markdown 格式
    └── categories_index.json # 分类索引
```

### 索引机制

**items/index.json**: 快速查找记忆项
```json
{
  "item_id": {
    "resource_id": "...",
    "memory_type": "...",
    "categories": [...],
    "created_at": "..."
  }
}
```

**categories/categories_index.json**: 快速查找分类
```json
{
  "category_id": {
    "name": "...",
    "item_count": 5,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

---

## 🔍 检索机制

### 检索流程

```
查询请求
   │
   ▼
MemoryService.retrieve()
   │
   ├─→ 合并查询文本
   │
   ├─→ MemoryRetriever.retrieve()
   │   │
   │   ├─→ simple: 关键词匹配
   │   │   ├─→ 检查分类名称
   │   │   ├─→ 检查描述
   │   │   ├─→ 检查摘要
   │   │   └─→ 计算匹配分数
   │   │
   │   ├─→ rag: 向量相似度 (预留)
   │   └─→ llm: LLM 理解 (预留)
   │
   └─→ 返回匹配结果
```

### 检索策略对比

| 策略 | 实现状态 | 特点 | 适用场景 |
|------|---------|------|---------|
| simple | ✅ 已实现 | 关键词匹配，快速 | 简单查询 |
| rag | 🔄 预留 | 向量相似度，精确 | 语义查询 |
| llm | 🔄 预留 | LLM 理解，智能 | 复杂查询 |

---

## ✅ 功能验证

### 测试结果

#### 测试 1: 对话记忆化 ✅
```
输入: 包含姓名、职业、偏好的对话
输出:
- 资源ID: ✅
- 记忆项数量: 3 ✅
- 分类数量: 6 ✅
- 分类: preferences, habits, personal_info 等 ✅
```

#### 测试 2: 文本记忆化 ✅
```
输入: 文本内容
输出:
- 资源ID: ✅
- 记忆项数量: 1 ✅
```

#### 测试 3: 文档记忆化 ✅
```
输入: 文档标题和内容
输出:
- 资源ID: ✅
- 记忆项数量: 1 ✅
```

#### 测试 4: 记忆检索 ✅
```
输入: 查询文本
输出:
- 检索方法: simple ✅
- 匹配结果: ✅
```

#### 测试 5: 按分类搜索 ✅
```
输入: 分类名称 "preferences"
输出: 该分类下的所有记忆项 ✅
```

#### 测试 6: 获取所有分类 ✅
```
输出: 所有分类列表 ✅
```

#### 测试 7: 统计信息 ✅
```
输出:
- 资源数: 3 ✅
- 记忆项数: 5 ✅
- 分类数: 10 ✅
```

### 功能完整性检查清单

- ✅ 资源存储 (Resource Layer)
- ✅ 记忆项提取 (Memory Item Layer)
- ✅ 分类组织 (Memory Category Layer)
- ✅ 对话记忆化
- ✅ 文本记忆化
- ✅ 文档记忆化
- ✅ 简单检索
- ✅ 分类搜索
- ✅ 统计信息
- ✅ Markdown 生成
- ✅ 索引管理
- ✅ 可追溯性

---

## 🎯 设计特点

### 1. 可追溯性

每个记忆项都关联到原始资源:
```
Resource (resource_id) 
    └─→ Memory Items (item_ids)
            └─→ Memory Categories (category_ids)
```

**优势**: 
- 可以追溯到原始数据
- 支持数据审计
- 便于调试和问题排查

### 2. 增量更新

- 新记忆项可以添加到现有分类
- 分类支持版本管理
- Markdown 文件自动更新

**优势**:
- 支持持续学习
- 记忆可以逐步完善
- 版本控制

### 3. LLM 友好

- 分类层生成 Markdown 文件
- 结构化的记忆组织
- 易于 LLM 阅读和理解

**优势**:
- 便于 LLM 直接使用
- 减少格式转换开销
- 提高检索效率

### 4. 可扩展性

- 预留 LLM 提取接口
- 预留 RAG 检索接口
- 预留多模态支持接口

**优势**:
- 易于功能扩展
- 支持未来升级
- 架构灵活

---

## 📊 数据流图

### 记忆化数据流

```
用户输入
   │
   ▼
┌─────────────────┐
│  MemoryService  │
│   .memorize()   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│Resource│ │   Extractor   │
│ Layer  │ │  .extract()   │
└───┬────┘ └───────┬───────┘
    │              │
    │         ┌────▼────┐
    │         │ Memory  │
    │         │  Items  │
    │         └────┬────┘
    │              │
    │         ┌────▼──────┐
    │         │ Categories│
    │         └───────────┘
    │
    └──────────────┐
                   │
             返回结果
```

### 检索数据流

```
查询请求
   │
   ▼
┌─────────────────┐
│  MemoryService  │
│   .retrieve()   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Retriever     │
│  .retrieve()    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│Simple  │ │  RAG/LLM  │
│Match   │ │ (预留)    │
└───┬────┘ └─────┬─────┘
    │            │
    └─────┬──────┘
          │
          ▼
    检索结果
```

---

## 🔌 API 接口

### REST API

**基础地址**: `http://localhost:8000`

#### 记忆化接口

**对话记忆**:
```http
POST /api/v1/memory/memorize/conversation
Content-Type: application/json

{
  "messages": [...],
  "user_id": "user_123",
  "agent_id": "agent_001"
}
```

**文本记忆**:
```http
POST /api/v1/memory/memorize/text
Content-Type: application/json

{
  "text": "...",
  "context": {...},
  "user_id": "user_123"
}
```

**文档记忆**:
```http
POST /api/v1/memory/memorize/document
Content-Type: application/json

{
  "title": "...",
  "content": "...",
  "author": "...",
  "user_id": "user_123"
}
```

#### 检索接口

```http
POST /api/v1/memory/retrieve
Content-Type: application/json

{
  "queries": [
    {"role": "user", "content": {"text": "..."}}
  ],
  "where": {"user_id": "user_123"},
  "limit": 10
}
```

#### 统计接口

```http
GET /api/v1/stats
```

**响应**:
```json
{
  "statistics": {
    "resources_count": 10,
    "items_count": 30,
    "categories_count": 6
  }
}
```

---

## 🚀 使用示例

### Python 代码示例

```python
import asyncio
from hscore import MemoryService

async def main():
    # 初始化服务
    service = MemoryService(
        base_path="./memory_data",
        retrieve_config={"method": "simple"}
    )
    
    # 记忆化对话
    conversation = {
        "messages": [
            {"role": "user", "content": "我叫张三，喜欢编程"},
            {"role": "assistant", "content": "你好张三！"}
        ]
    }
    
    result = await service.memorize(
        resource_data=conversation,
        modality="conversation",
        user_id="user_001"
    )
    
    print(f"创建了 {result['items_count']} 个记忆项")
    
    # 检索记忆
    queries = [{"role": "user", "content": {"text": "张三喜欢什么？"}}]
    retrieve_result = await service.retrieve(queries=queries)
    
    print(f"找到 {len(retrieve_result['items'])} 个相关记忆")

asyncio.run(main())
```

---

## 📈 性能特点

### 存储性能

- **文件系统存储**: 快速读写
- **JSON 格式**: 易于解析
- **索引机制**: 快速查找

### 检索性能

- **简单检索**: O(n) 时间复杂度
- **分类检索**: O(1) 索引查找
- **预留优化**: RAG/LLM 检索

### 扩展性

- **水平扩展**: 支持多实例
- **垂直扩展**: 支持更大数据量
- **功能扩展**: 预留接口

---

## 🔮 未来规划

### 短期 (1-2周)

- [ ] 集成 LLM 进行智能提取
- [ ] 改进规则提取逻辑
- [ ] 实现向量检索 (RAG)

### 中期 (1-2月)

- [ ] 记忆重要性自动评估
- [ ] 记忆遗忘机制
- [ ] 记忆关联分析
- [ ] Web UI 管理界面

### 长期 (3-6月)

- [ ] 分布式存储
- [ ] 实时记忆更新
- [ ] 自动记忆整理
- [ ] 智能推荐

---

## 📝 总结

HSMem 记忆系统实现了完整的三层架构设计，具备以下特点:

✅ **完整性**: 从资源存储到记忆检索的完整流程
✅ **可追溯性**: 完整的追溯链
✅ **可扩展性**: 预留多种扩展接口
✅ **LLM 友好**: Markdown 格式便于 LLM 阅读
✅ **持久化**: 文件系统存储，数据安全可靠
✅ **功能验证**: 所有核心功能测试通过

系统已准备好与 HeartSphere 项目集成，为 AI 伴侣提供持久化记忆能力。

---

## 📚 相关文档

- `DESIGN_ARCHITECTURE.md` - 详细架构设计文档
- `README.md` - 项目说明
- `USAGE.md` - 使用指南
- `QUICKSTART.md` - 快速开始
- `PROJECT_SUMMARY.md` - 项目总结

---

**最后更新**: 2026-01-11
**版本**: 1.0.0
