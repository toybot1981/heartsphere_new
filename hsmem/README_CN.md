# HSMem - HeartSphere 记忆系统

> 基于 memU 设计理念的轻量级 AI 记忆系统

[![Python Version](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](LICENSE)

## 📖 简介

HSMem (HeartSphere Memory System) 是一个为 HeartSphere 项目设计的独立记忆系统。它实现了 memU 的核心设计理念，为 AI 伴侣提供持久化记忆能力。

### 核心特性

- 🧠 **三层架构**: Resource → Memory Item → Memory Category
- 🔄 **多模态支持**: 文本、对话、文档等多种数据形式
- 🔍 **灵活检索**: 支持简单检索、RAG、LLM-based 检索
- 💾 **持久化存储**: 本地文件存储，易于扩展和迁移
- 📝 **LLM 友好**: 自动生成 Markdown 文件便于 LLM 阅读
- 🚀 **轻量级**: 无需复杂依赖，快速启动

## 🚀 快速开始

### 安装

```bash
cd hsmem
pip install -r requirements.txt
```

### 运行示例

```bash
# 快速开始
python3 examples/quick_start.py

# 对话记忆示例
python3 examples/example_1_conversation.py

# 记忆检索示例
python3 examples/example_2_retrieval.py
```

### 代码示例

```python
import asyncio
from hscore import MemoryService

async def main():
    # 初始化记忆服务
    service = MemoryService(
        base_path="./memory_data",
        retrieve_config={"method": "simple"}
    )

    # 记忆化对话
    conversation = {
        "messages": [
            {"role": "user", "content": "我叫李明，喜欢喝咖啡"},
            {"role": "assistant", "content": "你好李明！"},
            {"role": "user", "content": "我每天早上都会喝一杯"}
        ]
    }

    memory = await service.memorize(
        resource_data=conversation,
        modality="conversation",
        user_id="user_001"
    )

    print(f"创建了 {memory['items_count']} 个记忆项")

    # 检索记忆
    queries = [
        {"role": "user", "content": {"text": "李明喜欢什么？"}}
    ]

    result = await service.retrieve(queries=queries)
    print(f"检索到 {len(result['items'])} 个相关记忆")

asyncio.run(main())
```

## 🏗️ 系统架构

### 三层架构设计

```
┌─────────────────────────────────────────┐
│      Memory Category Layer              │
│  (聚合的结构化记忆 - Markdown 文件)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────┴──────────────────────────┐
│      Memory Item Layer                  │
│  (离散的记忆单元 - JSON 文件)            │
└──────────────┬──────────────────────────┘
               │
┌──────────────┴──────────────────────────┐
│      Resource Layer                     │
│  (原始多模态数据 - JSON 文件)            │
└─────────────────────────────────────────┘
```

### 1. Resource Layer（资源层）

存储原始多模态数据，保持数据的完整性和可追溯性。

**功能**:
- 存储原始对话、文本、文档等数据
- 按模态类型组织存储
- 提供资源检索接口

**数据格式**:
```json
{
  "id": "uuid",
  "modality": "conversation",
  "data": {...},
  "created_at": "2026-01-11T12:00:00"
}
```

### 2. Memory Item Layer（记忆项层）

从资源中提取的离散记忆单元。

**功能**:
- 从资源中提取记忆项
- 包含内容、摘要、类型、分类
- 支持重要性评分
- 建立与资源的关联

**数据格式**:
```json
{
  "id": "uuid",
  "resource_id": "uuid",
  "content": "完整内容",
  "summary": "摘要",
  "memory_type": "preference",
  "categories": ["preferences", "user_profile"],
  "importance": 0.7,
  "created_at": "2026-01-11T12:00:00"
}
```

### 3. Memory Category Layer（记忆分类层）

将相关记忆项聚合成结构化的文本记忆。

**功能**:
- 聚合相关记忆项
- 生成 Markdown 文件便于 LLM 阅读
- 支持增量更新
- 自动版本管理

**Markdown 格式**:
```markdown
# preferences

## 概述
关于偏好的记忆

## 描述
包含 5 个记忆项

## 创建时间
2026-01-11T12:00:00
```

## 📚 API 文档

### MemoryService

记忆服务的主接口，整合记忆提取和检索功能。

#### 初始化

```python
service = MemoryService(
    base_path="./memory_data",      # 存储路径
    llm_client=None,                # 可选的 LLM 客户端
    retrieve_config={"method": "simple"}  # 检索配置
)
```

#### 主要方法

**memorize()** - 记忆化资源

```python
memory = await service.memorize(
    resource_data=conversation_dict,  # 资源数据
    modality="conversation",          # 模态类型
    user_id="user_123",              # 用户 ID（可选）
    agent_id="agent_1"               # 代理 ID（可选）
)
```

**retrieve()** - 检索记忆

```python
result = await service.retrieve(
    queries=[{"role": "user", "content": {"text": "查询内容"}}],
    where={"user_id": "user_123"},   # 过滤条件（可选）
    limit=10                          # 返回数量限制
)
```

**get_statistics()** - 获取统计信息

```python
stats = await service.get_statistics()
# 返回: {"resources_count": 10, "items_count": 30, "categories_count": 5}
```

**get_all_categories()** - 获取所有分类

```python
categories = await service.get_all_categories()
```

**search_by_category()** - 按分类搜索

```python
items = await service.search_by_category("preferences")
```

## 🎯 使用场景

### 1. 对话记忆

从用户对话中提取偏好、习惯、个人信息等。

```python
conversation = {
    "messages": [
        {"role": "user", "content": "我喜欢喝咖啡"},
        {"role": "assistant", "content": "好的，记住了"},
        {"role": "user", "content": "每天早上都要喝"}
    ]
}

memory = await service.memorize(conversation, modality="conversation")
```

### 2. 文本记忆

记忆重要的文本信息。

```python
text_data = {
    "text": "这是一段重要的文本内容",
    "context": {"categories": ["knowledge"]}
}

memory = await service.memorize(text_data, modality="text")
```

### 3. 文档记忆

从文档中提取结构化知识。

```python
document = {
    "title": "Python 教程",
    "content": "Python 是一种高级编程语言..."
}

memory = await service.memorize(document, modality="document")
```

## 🔧 配置

### config.yaml

```yaml
memory_store:
  base_path: "./memory_data"
  auto_save: true

extraction:
  default_method: "rule_based"
  max_items_per_resource: 50

retrieval:
  default_method: "simple"
  max_results: 10
```

### 检索策略

- **simple**: 基于关键词的简单检索（默认）
- **rag**: 基于向量相似度的检索（需要额外配置）
- **llm**: 基于 LLM 深度理解的检索（需要 LLM 配置）

## 📁 项目结构

```
hsmem/
├── hscore/                    # 核心模块
│   ├── storage/               # 存储层
│   │   ├── resource_layer.py
│   │   ├── memory_item_layer.py
│   │   ├── memory_category_layer.py
│   │   └── memory_store.py
│   └── memory/                # 记忆处理
│       ├── memory_service.py
│       ├── memory_extractor.py
│       └── memory_retriever.py
├── examples/                  # 示例代码
│   ├── quick_start.py
│   ├── example_1_conversation.py
│   └── example_2_retrieval.py
├── memory_data/              # 生成的记忆数据
├── config.yaml
├── requirements.txt
├── README.md
├── USAGE.md
└── PROJECT_SUMMARY.md
```

## 🚧 未来计划

- [ ] 集成 LLM 进行智能记忆提取
- [ ] 实现真正的 RAG 检索（向量数据库）
- [ ] 支持图像、音频、视频记忆
- [ ] 记忆重要性自动评估
- [ ] 记忆遗忘机制
- [ ] Web UI 管理界面
- [ ] 与 HeartSphere 后端深度集成

## 🤝 与 memU 的关系

HSMem 实现了 [memU](https://github.com/NevaMind-AI/memU) 的核心设计理念：

- ✅ 三层架构（Resource → Item → Category）
- ✅ 记忆提取和聚合
- ✅ 多种检索策略
- ✅ LLM 友好的存储格式

由于网络原因无法直接克隆 memU，HSMem 是一个基于其设计理念的独立实现。

## 📄 许可证

Apache License 2.0

## 🙏 致谢

- [memU](https://github.com/NevaMind-AI/memU) - 提供了优秀的设计理念
- HeartSphere Team - 项目支持

## 📮 联系方式

如有问题或建议，欢迎联系 HeartSphere 团队。

---

**HSMem** - 为 AI 伴侣提供持久化记忆能力 ❤️
