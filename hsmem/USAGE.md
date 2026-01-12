# HSMem 使用指南

## 概述

HSMem (HeartSphere Memory System) 是一个基于 memU 设计理念的轻量级记忆系统，为 HeartSphere 项目提供持久化记忆能力。

## 系统架构

### 三层架构

1. **Resource Layer（资源层）**
   - 存储原始多模态数据
   - 保持数据的完整性和可追溯性
   - 位置: `memory_data/resources/`

2. **Memory Item Layer（记忆项层）**
   - 从资源中提取的离散记忆单元
   - 包含内容、摘要、类型、分类等信息
   - 位置: `memory_data/items/`

3. **Memory Category Layer（记忆分类层）**
   - 将相关记忆项聚合成结构化的文本记忆
   - 生成 Markdown 文件便于 LLM 阅读
   - 位置: `memory_data/categories/`

## 快速开始

### 1. 安装依赖

```bash
cd hsmem
pip install -r requirements.txt
```

### 2. 基本使用

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
            {"role": "user", "content": "我叫张三"},
            {"role": "assistant", "content": "你好张三！"}
        ]
    }

    memory = await service.memorize(
        resource_data=conversation,
        modality="conversation",
        user_id="user_123"
    )

    print(f"创建了 {memory['items_count']} 个记忆项")

    # 检索记忆
    queries = [{"role": "user", "content": {"text": "张三是谁？"}}]
    result = await service.retrieve(queries=queries)

asyncio.run(main())
```

### 3. 运行示例

```bash
# 快速开始示例
python3 examples/quick_start.py

# 对话记忆示例
python3 examples/example_1_conversation.py

# 记忆检索示例
python3 examples/example_2_retrieval.py
```

## 核心功能

### 记忆化 (Memorize)

支持多种模态的数据记忆化：

- **conversation**: 对话记忆
- **text**: 文本记忆
- **document**: 文档记忆

```python
# 对话记忆
memory = await service.memorize(
    resource_data=conversation_dict,
    modality="conversation",
    user_id="user_123"
)

# 文本记忆
memory = await service.memorize(
    resource_data={"text": "这是一段重要文本"},
    modality="text"
)

# 文档记忆
memory = await service.memorize(
    resource_data={
        "title": "文档标题",
        "content": "文档内容"
    },
    modality="document"
)
```

### 检索 (Retrieve)

支持多种检索策略：

- **simple**: 基于关键词的简单检索
- **rag**: 基于向量相似度的检索（需要额外配置）
- **llm**: 基于 LLM 深度理解的检索（需要 LLM 配置）

```python
# 简单检索
service = MemoryService(
    retrieve_config={"method": "simple"}
)

result = await service.retrieve(
    queries=[{"role": "user", "content": {"text": "查询内容"}}],
    where={"user_id": "user_123"},  # 可选的过滤条件
    limit=10
)

# 按分类检索
items = await service.search_by_category("preferences")

# 获取所有分类
categories = await service.get_all_categories()
```

## 数据存储

### 文件结构

```
memory_data/
├── resources/          # 原始资源
│   ├── conversation/   # 对话资源
│   ├── text/          # 文本资源
│   └── document/      # 文档资源
├── items/             # 记忆项
│   ├── {item_id}.json
│   └── index.json
└── categories/        # 记忆分类
    ├── {category_id}.json
    ├── {category_id}.md
    └── categories_index.json
```

### 数据格式

**资源文件示例**:
```json
{
  "id": "uuid",
  "modality": "conversation",
  "data": {...},
  "created_at": "2026-01-11T12:00:00",
  "metadata": {...}
}
```

**记忆项文件示例**:
```json
{
  "id": "uuid",
  "resource_id": "uuid",
  "content": "完整内容",
  "summary": "摘要",
  "memory_type": "preference",
  "importance": 0.7,
  "categories": ["preferences", "user_profile"],
  "created_at": "2026-01-11T12:00:00"
}
```

**记忆分类 Markdown 示例**:
```markdown
# preferences

## 概述
关于偏好的记忆

## 描述
包含 5 个记忆项

## 包含记忆项数量
5
```

## 高级配置

### 配置文件 (config.yaml)

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

### 集成 LLM

```python
import openai

# 配置 LLM 客户端
llm_client = openai.AsyncOpenAI(api_key="your-key")

service = MemoryService(
    base_path="./memory_data",
    llm_client=llm_client,
    retrieve_config={"method": "llm"}
)
```

## API 参考

### MemoryService

**初始化参数**:
- `base_path`: 存储基础路径
- `llm_client`: LLM 客户端（可选）
- `retrieve_config`: 检索配置（可选）

**主要方法**:
- `memorize()`: 记忆化资源
- `retrieve()`: 检索记忆
- `get_statistics()`: 获取统计信息
- `get_all_categories()`: 获取所有分类
- `search_by_category()`: 按分类搜索

## 性能优化

### 批量记忆化

```python
# 批量处理多个对话
conversations = [...]
for conv in conversations:
    await service.memorize(conv, modality="conversation")
```

### 增量更新

```python
# 同一用户的多次对话会自动增量更新记忆
await service.memorize(conv1, modality="conversation", user_id="user_1")
await service.memorize(conv2, modality="conversation", user_id="user_1")
# 第二次调用会更新已有记忆分类
```

## 常见问题

### Q: 如何清理旧记忆？

A: 可以直接删除对应的文件，或实现清理逻辑：

```python
import shutil
shutil.rmtree("memory_data")
```

### Q: 如何导出记忆？

A: 记忆分类已经自动生成为 Markdown 文件，可以直接使用：

```python
categories = await service.get_all_categories()
for cat in categories:
    print(cat['name'], cat['summary'])
```

### Q: 如何与 HeartSphere 后端集成？

A: 可以创建 REST API 接口：

```python
from fastapi import FastAPI

app = FastAPI()
service = MemoryService()

@app.post("/memorize")
async def memorize_endpoint(data: dict):
    return await service.memorize(data)

@app.post("/retrieve")
async def retrieve_endpoint(queries: list):
    return await service.retrieve(queries)
```

## 未来计划

- [ ] 支持图像、音频、视频记忆
- [ ] 集成向量数据库实现真正的 RAG
- [ ] 记忆重要性自动评估
- [ ] 记忆遗忘机制
- [ ] 与 HeartSphere 后端深度集成
- [ ] Web UI 界面

## 许可证

Apache License 2.0

## 致谢

本项目受到 [memU](https://github.com/NevaMind-AI/memU) 启发，实现了其核心设计理念。
